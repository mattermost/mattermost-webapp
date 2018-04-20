// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch} from 'react-router-dom';
import iNoBounce from 'inobounce';

import {loadStatusesForChannelAndSidebar, startPeriodicStatusUpdates, stopPeriodicStatusUpdates} from 'actions/status_actions.jsx';
import {startPeriodicSync, stopPeriodicSync, reconnect} from 'actions/websocket_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import BrowserStore from 'stores/browser_store';
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

export default class NeedsTeam extends React.Component {
    static propTypes = {
        params: PropTypes.object,
        actions: PropTypes.shape({
            fetchMyChannelsAndMembers: PropTypes.func.isRequired,
            getMyTeamUnreads: PropTypes.func.isRequired,
            viewChannel: PropTypes.func.isRequired,
            markChannelAsRead: PropTypes.func.isRequired,
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
    };

    constructor(params) {
        super(params);

        this.shortcutKeyDown = (e) => this.onShortcutKeyDown(e);
        this.updateCurrentTeam = this.updateCurrentTeam.bind(this);

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
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.team !== nextProps.match.params.team) {
            this.setState({team: this.updateCurrentTeam(nextProps)});
        }
    }

    updateCurrentTeam(props) {
        // First check to make sure you're in the current team
        // for the current url.
        const teamName = props.match.params.team;
        const team = TeamStore.getByName(teamName);

        if (!team) {
            props.history.push('/?redirect_to=' + encodeURIComponent(props.location.pathname));
            return null;
        }

        // If current team is set, then this is not first load
        // The first load action pulls team unreads
        if (TeamStore.getCurrentId()) {
            this.props.actions.getMyTeamUnreads();
        }

        TeamStore.saveMyTeam(team);
        BrowserStore.setGlobalItem('team', team.id);
        TeamStore.emitChange();
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

    onShortcutKeyDown(e) {
        if (e.shiftKey && Utils.cmdOrCtrlPressed(e) && Utils.isKeyPressed(e, Constants.KeyCodes.L)) {
            if (document.getElementById('sidebar-right').className.match('sidebar--right sidebar--right--expanded')) {
                document.getElementById('reply_textbox').focus();
            } else {
                document.getElementById('post_textbox').focus();
            }
        }
    }

    componentDidMount() {
        startPeriodicStatusUpdates();
        startPeriodicSync();

        // Set up tracking for whether the window is active
        window.isActive = true;
        $(window).on('focus', async () => {
            await this.props.actions.markChannelAsRead(ChannelStore.getCurrentId());
            ChannelStore.emitChange();
            window.isActive = true;

            if (new Date().getTime() - this.blurTime > UNREAD_CHECK_TIME_MILLISECONDS) {
                this.props.actions.fetchMyChannelsAndMembers(TeamStore.getCurrentId()).then(loadProfilesForSidebar);
            }
        });

        $(window).on('blur', () => {
            window.isActive = false;
            this.blurTime = new Date().getTime();
            if (UserStore.getCurrentUser()) {
                this.props.actions.viewChannel('');
            }
        });

        Utils.applyTheme(this.props.theme);

        if (UserAgent.isIosSafari()) {
            // Use iNoBounce to prevent scrolling past the boundaries of the page
            iNoBounce.enable();
        }
        document.addEventListener('keydown', this.shortcutKeyDown);
    }

    componentWillUnmount() {
        $(window).off('focus');
        $(window).off('blur');

        if (UserAgent.isIosSafari()) {
            iNoBounce.disable();
        }
        stopPeriodicStatusUpdates();
        stopPeriodicSync();
        clearInterval(wakeUpInterval);
        document.removeEventListener('keydown', this.shortcutKeyDown);
    }

    componentDidUpdate(prevProps) {
        const {theme} = this.props;
        if (!Utils.areObjectsEqual(prevProps.theme, theme)) {
            Utils.applyTheme(theme);
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
