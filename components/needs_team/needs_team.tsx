// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Route, Switch} from 'react-router-dom';
import iNoBounce from 'inobounce';

import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {Team, TeamMembership} from 'mattermost-redux/types/teams';
import {Group} from 'mattermost-redux/types/groups';
import {UserStatus} from 'mattermost-redux/types/users';

import {startPeriodicStatusUpdates, stopPeriodicStatusUpdates} from 'actions/status_actions.jsx';
import {startPeriodicSync, stopPeriodicSync, reconnect} from 'actions/websocket_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';

import Constants from 'utils/constants';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';

import {makeAsyncComponent} from 'components/async_load';
const LazyBackstageController = React.lazy(() => import('components/backstage'));
import ChannelController from 'components/channel_layout/channel_controller';
import Pluggable from 'plugins/pluggable';

const BackstageController = makeAsyncComponent(LazyBackstageController);

let wakeUpInterval: number;
let lastTime = Date.now();
const WAKEUP_CHECK_INTERVAL = 30000; // 30 seconds
const WAKEUP_THRESHOLD = 60000; // 60 seconds
const UNREAD_CHECK_TIME_MILLISECONDS = 10000;

declare global {
    interface Window {
        isActive: boolean;
    }
}

type Props = {
    license: Record<string, any>;
    currentUser?: {
        id: string;
    };
    currentChannelId?: string;
    currentTeamId?: string;
    useLegacyLHS: boolean;
    actions: {
        fetchMyChannelsAndMembers: (teamId: string) => Promise<{data: {channels: Channel[]; members: ChannelMembership[]}}>;
        getMyTeamUnreads: () => Promise<{data: any; error?: any}>;
        viewChannel: (channelId: string, prevChannelId?: string | undefined) => Promise<{data: boolean}>;
        markChannelAsReadOnFocus: (channelId: string) => Promise<{data: any; error?: any}>;
        getTeamByName: (teamName: string) => Promise<{data: Team}>;
        addUserToTeam: (teamId: string, userId?: string) => Promise<{data: TeamMembership; error?: any}>;
        selectTeam: (team: Team) => Promise<{data: boolean}>;
        setPreviousTeamId: (teamId: string) => Promise<{data: boolean}>;
        loadStatusesForChannelAndSidebar: () => Promise<{data: UserStatus[]}>;
        loadProfilesForDirect: () => Promise<{data: boolean}>;
        getAllGroupsAssociatedToChannelsInTeam: (teamId: string, filterAllowReference: boolean) => Promise<{data: Group[]}>;
        getAllGroupsAssociatedToTeam: (teamId: string, filterAllowReference: boolean) => Promise<{data: Group[]}>;
        getGroupsByUserId: (userID: string) => Promise<{data: Group[]}>;
        getGroups: (filterAllowReference: boolean, page: number, perPage: number) => Promise<{data: Group[]}>;
    };
    mfaRequired: boolean;
    match: {
        params: {
            team: string;
        };
    };
    previousTeamId?: string;
    history: {
        push(path: string): void;
    };
    teamsList: Team[];
    theme: any;
    plugins?: any;
}

type State = {
    team: Team | null;
    finishedFetchingChannels: boolean;
    prevTeam: string;
    teamsList: Team[];
}

export default class NeedsTeam extends React.PureComponent<Props, State> {
    public blurTime: number;
    constructor(props: Props) {
        super(props);
        this.blurTime = new Date().getTime();

        if (this.props.mfaRequired) {
            this.props.history.push('/mfa/setup');
            return;
        }

        clearInterval(wakeUpInterval);

        wakeUpInterval = window.setInterval(() => {
            const currentTime = (new Date()).getTime();
            if (currentTime > (lastTime + WAKEUP_THRESHOLD)) { // ignore small delays
                console.log('computer woke up - fetching latest'); //eslint-disable-line no-console
                reconnect(false);
            }
            lastTime = currentTime;
        }, WAKEUP_CHECK_INTERVAL);

        const team = this.updateCurrentTeam(this.props);

        this.state = {
            team,
            finishedFetchingChannels: false,
            prevTeam: this.props.match.params.team,
            teamsList: this.props.teamsList,
        };

        if (!team) {
            this.joinTeam(this.props);
        }
    }

    static getDerivedStateFromProps(nextProps: Props, state: State) {
        if (state.prevTeam !== nextProps.match.params.team) {
            const team = nextProps.teamsList ?
                nextProps.teamsList.find((teamObj: Team) =>
                    teamObj.name === nextProps.match.params.team) : null;
            return {
                prevTeam: nextProps.match.params.team,
                team: (team || null),
            };
        }
        return {prevTeam: nextProps.match.params.team};
    }

    public componentDidMount() {
        startPeriodicStatusUpdates();
        startPeriodicSync();

        // Set up tracking for whether the window is active
        window.isActive = true;
        Utils.applyTheme(this.props.theme);

        if (UserAgent.isIosSafari()) {
            // Use iNoBounce to prevent scrolling past the boundaries of the page
            iNoBounce.enable();
        }

        window.addEventListener('focus', this.handleFocus);
        window.addEventListener('blur', this.handleBlur);
        window.addEventListener('keydown', this.onShortcutKeyDown);
    }

    componentDidUpdate(prevProps: Props) {
        const {theme} = this.props;
        if (!Utils.areObjectsEqual(prevProps.theme, theme)) {
            Utils.applyTheme(theme);
        }
        if (this.props.match.params.team !== prevProps.match.params.team) {
            if (this.state.team) {
                this.initTeam(this.state.team);
            }
            if (!this.state.team) {
                this.joinTeam(this.props);
            }
        }
    }

    componentWillUnmount() {
        window.isActive = false;
        stopPeriodicStatusUpdates();
        stopPeriodicSync();
        if (UserAgent.isIosSafari()) {
            iNoBounce.disable();
        }

        clearInterval(wakeUpInterval);
        window.removeEventListener('focus', this.handleFocus);
        window.removeEventListener('blur', this.handleBlur);
        window.removeEventListener('keydown', this.onShortcutKeyDown);
    }

    handleBlur = () => {
        window.isActive = false;
        this.blurTime = new Date().getTime();
        if (this.props.currentUser) {
            this.props.actions.viewChannel('');
        }
    }

    handleFocus = () => {
        if (this.props.currentChannelId) {
            this.props.actions.markChannelAsReadOnFocus(this.props.currentChannelId);
            window.isActive = true;
        }
        if (Date.now() - this.blurTime > UNREAD_CHECK_TIME_MILLISECONDS && this.props.currentTeamId) {
            this.props.actions.fetchMyChannelsAndMembers(this.props.currentTeamId);
            this.props.actions.loadProfilesForDirect();
        }
    }

    joinTeam = async (props: Props) => {
        const {data: team} = await this.props.actions.getTeamByName(props.match.params.team);
        if (team && team.delete_at === 0) {
            const {error} = await props.actions.addUserToTeam(team.id, props.currentUser && props.currentUser.id);
            if (error) {
                props.history.push('/error?type=team_not_found');
            } else {
                this.setState({team});
                this.initTeam(team);
            }
        } else {
            props.history.push('/error?type=team_not_found');
        }
    }

    initTeam = (team: Team) => {
        if (team.id !== this.props.previousTeamId) {
            GlobalActions.emitCloseRightHandSide();
        }

        // If current team is set, then this is not first load
        // The first load action pulls team unreads
        this.props.actions.getMyTeamUnreads();
        this.props.actions.selectTeam(team);
        this.props.actions.setPreviousTeamId(team.id);

        if (Utils.isGuest(this.props.currentUser)) {
            this.setState({finishedFetchingChannels: false});
        }
        this.props.actions.fetchMyChannelsAndMembers(team.id).then(
            () => {
                this.setState({
                    finishedFetchingChannels: true,
                });
            },
        );

        this.props.actions.loadStatusesForChannelAndSidebar();
        this.props.actions.loadProfilesForDirect();

        if (this.props.license &&
            this.props.license.IsLicensed === 'true' &&
            this.props.license.LDAPGroups === 'true') {
            if (this.props.currentUser) {
                this.props.actions.getGroupsByUserId(this.props.currentUser.id);
            }

            this.props.actions.getAllGroupsAssociatedToChannelsInTeam(team.id, true);
            if (team.group_constrained) {
                this.props.actions.getAllGroupsAssociatedToTeam(team.id, true);
            } else {
                this.props.actions.getGroups(true, 0, 0);
            }
        }

        return team;
    }

    updateCurrentTeam = (props: Props) => {
        // First check to make sure you're in the current team
        // for the current url.
        const team = props.teamsList ? props.teamsList.find((teamObj) => teamObj.name === props.match.params.team) : null;
        if (team) {
            this.initTeam(team);
            return team;
        }
        return null;
    }

    onShortcutKeyDown = (e: KeyboardEvent) => {
        if (e.shiftKey && Utils.cmdOrCtrlPressed(e) && Utils.isKeyPressed(e, Constants.KeyCodes.L)) {
            const sidebar = document.getElementById('sidebar-right');
            if (sidebar) {
                if (sidebar.className.match('sidebar--right sidebar--right--expanded move--left')) {
                    const replyTextbox = document.getElementById('reply_textbox');
                    if (replyTextbox) {
                        replyTextbox.focus();
                    }
                } else {
                    const postTextbox = document.getElementById('post_textbox');
                    if (postTextbox) {
                        postTextbox.focus();
                    }
                }
            }
        }
    }

    render() {
        if (this.state.team === null) {
            return <div/>;
        }
        const teamType = this.state.team ? this.state.team.type : '';

        return (
            <Switch>
                <Route
                    path={'/:team/integrations'}
                    component={BackstageController}
                />
                <Route
                    path={'/:team/emoji'}
                    component={BackstageController}
                />
                {this.props.plugins?.map((plugin: any) => (
                    <Route
                        key={plugin.id}
                        path={'/:team/' + plugin.route}
                        render={() => (
                            <Pluggable
                                pluggableName={'NeedsTeamComponent'}
                                pluggableId={plugin.id}
                            />
                        )}
                    />
                ))}
                <Route
                    render={(renderProps) => (
                        <ChannelController
                            pathName={renderProps.location.pathname}
                            teamType={teamType}
                            fetchingChannels={!this.state.finishedFetchingChannels}
                            useLegacyLHS={this.props.useLegacyLHS}
                        />
                    )}
                />
            </Switch>
        );
    }
}
