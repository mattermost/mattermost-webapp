// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch} from 'react-router-dom';
import iNoBounce from 'inobounce';

import {loadStatusesForChannelAndSidebar, startPeriodicStatusUpdates, stopPeriodicStatusUpdates} from 'actions/status_actions.jsx';
import {startPeriodicSync, stopPeriodicSync, reconnect} from 'actions/websocket_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import {loadProfilesForSidebar} from 'actions/user_actions.jsx';
import {makeAsyncComponent} from 'components/async_load';
import loadBackstageController from 'bundle-loader?lazy!components/backstage';
import ChannelController from 'components/channel_layout/channel_controller';

const BackstageController = makeAsyncComponent(loadBackstageController);

let wakeUpInterval;
let lastTime = (new Date()).getTime();
const WAKEUP_CHECK_INTERVAL = 30000; // 30 seconds
const WAKEUP_THRESHOLD = 60000; // 60 seconds
const UNREAD_CHECK_TIME_MILLISECONDS = 10000;
const TEAMS_PER_PAGE = 200;

export default class NeedsTeam extends React.Component {
    static propTypes = {
        params: PropTypes.object,
        currentUser: PropTypes.object,
        currentChannelId: PropTypes.string,
        currentTeamId: PropTypes.string,
        teamsList: PropTypes.array,
        actions: PropTypes.shape({
            fetchMyChannelsAndMembers: PropTypes.func.isRequired,
            getMyTeamUnreads: PropTypes.func.isRequired,
            viewChannel: PropTypes.func.isRequired,
            markChannelAsRead: PropTypes.func.isRequired,
            getTeams: PropTypes.func.isRequired,
            joinTeam: PropTypes.func.isRequired,
            selectTeam: PropTypes.func.isRequired,
            setGlobalItem: PropTypes.func.isRequired,
        }).isRequired,
        theme: PropTypes.object.isRequired,
        mfaRequired: PropTypes.bool.isRequired,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                team: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        history: PropTypes.object.isRequired,
    };

    constructor(params) {
        super(params);
        this.blurTime = new Date().getTime();

        if (this.props.mfaRequired) {
            this.props.history.push('/mfa/setup');
            return;
        }

        clearInterval(wakeUpInterval);

        wakeUpInterval = setInterval(() => {
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
        };

        if (!team) {
            this.joinTeam(this.props);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.match.params.team !== nextProps.match.params.team) {
            const team = this.updateCurrentTeam(nextProps);
            this.setState({
                team,
            });
            if (!team) {
                this.joinTeam(nextProps);
            }
        }
    }

    componentDidMount() {
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

    componentDidUpdate(prevProps) {
        const {theme} = this.props;
        if (!Utils.areObjectsEqual(prevProps.theme, theme)) {
            Utils.applyTheme(theme);
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
        this.props.actions.markChannelAsRead(this.props.currentChannelId);
        window.isActive = true;

        if (new Date().getTime() - this.blurTime > UNREAD_CHECK_TIME_MILLISECONDS) {
            this.props.actions.fetchMyChannelsAndMembers(this.props.currentTeamId).then(loadProfilesForSidebar);
        }
    }

    joinTeam = async (props) => {
        const openTeams = await this.props.actions.getTeams(0, TEAMS_PER_PAGE);
        const team = openTeams.data.find((teamObj) => teamObj.name === props.match.params.team);
        if (team) {
            const {error} = await props.actions.joinTeam(team.invite_id, team.id);
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

    initTeam = (team) => {
        // If current team is set, then this is not first load
        // The first load action pulls team unreads
        this.props.actions.getMyTeamUnreads();
        this.props.actions.selectTeam(team);
        this.props.actions.setGlobalItem('team', team.id);
        GlobalActions.emitCloseRightHandSide();

        this.props.actions.fetchMyChannelsAndMembers(team.id).then(
            () => {
                this.setState({
                    finishedFetchingChannels: true,
                });
            }
        );

        loadStatusesForChannelAndSidebar();
        loadProfilesForSidebar();

        return team;
    }

    updateCurrentTeam = (props) => {
        // First check to make sure you're in the current team
        // for the current url.
        const team = props.teamsList ? props.teamsList.find((teamObj) => teamObj.name === props.match.params.team) : null;
        if (team) {
            this.initTeam(team);
            return team;
        }
        return null;
    }

    onShortcutKeyDown = (e) => {
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
        if (this.state.team === null || this.state.finishedFetchingChannels === false) {
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
                <Route
                    render={(renderProps) => (
                        <ChannelController
                            pathName={renderProps.location.pathname}
                            teamType={teamType}
                        />
                    )}
                />
            </Switch>
        );
    }
}
