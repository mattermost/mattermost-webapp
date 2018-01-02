// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';

import PropTypes from 'prop-types';
import React from 'react';
import {browserHistory} from 'react-router';

import iNoBounce from 'inobounce';

import {startPeriodicStatusUpdates, stopPeriodicStatusUpdates} from 'actions/status_actions.jsx';
import {loadProfilesForSidebar} from 'actions/user_actions.jsx';
import {startPeriodicSync, stopPeriodicSync} from 'actions/websocket_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';

import Pluggable from 'plugins/pluggable';

import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

import AnnouncementBar from 'components/announcement_bar';
import DeletePostModal from 'components/delete_post_modal.jsx';
import EditPostModal from 'components/edit_post_modal';
import GetPostLinkModal from 'components/get_post_link_modal';
import GetTeamInviteLinkModal from 'components/get_team_invite_link_modal';
import GetPublicLinkModal from 'components/get_public_link_modal';
import InviteMemberModal from 'components/invite_member_modal.jsx';
import LeaveTeamModal from 'components/leave_team_modal.jsx';
import LeavePrivateChannelModal from 'components/modals/leave_private_channel_modal.jsx';
import Navbar from 'components/navbar';
import RemovedFromChannelModal from 'components/removed_from_channel_modal.jsx';
import ResetStatusModal from 'components/reset_status_modal';
import ShortcutsModal from 'components/shortcuts_modal.jsx';
import SidebarRight from 'components/sidebar_right';
import SidebarRightMenu from 'components/sidebar_right_menu';
import TeamSettingsModal from 'components/team_settings_modal.jsx';
import ImportThemeModal from 'components/user_settings/import_theme_modal.jsx';
import UserSettingsModal from 'components/user_settings/user_settings_modal.jsx';
import WebrtcNotification from 'components/webrtc/components/webrtc_notification.jsx';
import WebrtcSidebar from 'components/webrtc/components/webrtc_sidebar.jsx';
import ModalController from 'components/modal_controller';

const TutorialSteps = Constants.TutorialSteps;
const Preferences = Constants.Preferences;

const UNREAD_CHECK_TIME_MILLISECONDS = 10000;

export default class NeedsTeam extends React.Component {
    static propTypes = {
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.element),
            PropTypes.element
        ]),
        navbar: PropTypes.element,
        params: PropTypes.object,
        sidebar: PropTypes.element,
        team_sidebar: PropTypes.element,
        center: PropTypes.element,
        user: PropTypes.object,
        actions: PropTypes.shape({
            viewChannel: PropTypes.func.isRequired,
            getMyChannelMembers: PropTypes.func.isRequired
        }).isRequired,
        theme: PropTypes.object.isRequired
    }

    constructor(params) {
        super(params);

        this.teamChanged = (e) => this.onTeamChanged(e);
        this.shortcutKeyDown = (e) => this.onShortcutKeyDown(e);

        this.blurTime = new Date().getTime();

        const team = TeamStore.getCurrent();

        this.state = {
            team
        };
    }

    onShortcutKeyDown(e) {
        if (e.shiftKey && Utils.cmdOrCtrlPressed(e) && e.keyCode === Constants.KeyCodes.L) {
            if (document.getElementById('sidebar-right').className.match('sidebar--right sidebar--right--expanded')) {
                document.getElementById('reply_textbox').focus();
            } else {
                document.getElementById('post_textbox').focus();
            }
        }
    }

    onTeamChanged() {
        const team = TeamStore.getCurrent();

        this.setState({
            team
        });
    }

    componentWillMount() {
        // Go to tutorial if we are first arriving
        const tutorialStep = PreferenceStore.getInt(Preferences.TUTORIAL_STEP, UserStore.getCurrentId(), 999);
        if (tutorialStep <= TutorialSteps.INTRO_SCREENS && global.window.mm_config.EnableTutorial === 'true') {
            browserHistory.push(TeamStore.getCurrentTeamRelativeUrl() + '/tutorial');
        }
    }

    componentDidMount() {
        TeamStore.addChangeListener(this.teamChanged);

        startPeriodicStatusUpdates();
        startPeriodicSync();

        // Set up tracking for whether the window is active
        window.isActive = true;
        $(window).on('focus', async () => {
            ChannelStore.resetCounts([ChannelStore.getCurrentId()]);
            ChannelStore.emitChange();
            window.isActive = true;

            await this.props.actions.viewChannel(ChannelStore.getCurrentId());
            if (new Date().getTime() - this.blurTime > UNREAD_CHECK_TIME_MILLISECONDS) {
                this.props.actions.getMyChannelMembers(TeamStore.getCurrentId()).then(loadProfilesForSidebar);
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
        TeamStore.removeChangeListener(this.teamChanged);
        $(window).off('focus');
        $(window).off('blur');

        if (UserAgent.isIosSafari()) {
            iNoBounce.disable();
        }
        stopPeriodicStatusUpdates();
        stopPeriodicSync();
        document.removeEventListener('keydown', this.shortcutKeyDown);
    }

    componentDidUpdate(prevProps) {
        const {theme} = this.props;
        if (!Utils.areObjectsEqual(prevProps.theme, theme)) {
            Utils.applyTheme(theme);
        }
    }

    render() {
        let content = [];
        if (this.props.children) {
            content = this.props.children;
        } else {
            content.push(
                this.props.navbar
            );
            content.push(this.props.team_sidebar);
            content.push(
                this.props.sidebar
            );
            content.push(
                <div
                    id='inner-wrap-webrtc'
                    key='inner-wrap'
                    className='inner-wrap channel__wrap'
                >
                    <div className='row header'>
                        <div id='navbar'>
                            <Navbar/>
                        </div>
                    </div>
                    <div className='row main'>
                        {React.cloneElement(this.props.center, {
                            user: this.props.user,
                            team: this.state.team
                        })}
                    </div>
                </div>
            );
        }

        return (
            <div className='channel-view'>
                <AnnouncementBar/>
                <WebrtcNotification/>
                <div className='container-fluid'>
                    <SidebarRight/>
                    <SidebarRightMenu teamType={this.state.team.type}/>
                    <WebrtcSidebar/>
                    {content}

                    <Pluggable pluggableName='Root'/>
                    <UserSettingsModal/>
                    <GetPostLinkModal/>
                    <GetPublicLinkModal/>
                    <GetTeamInviteLinkModal/>
                    <InviteMemberModal/>
                    <LeaveTeamModal/>
                    <ImportThemeModal/>
                    <TeamSettingsModal/>
                    <EditPostModal/>
                    <DeletePostModal/>
                    <RemovedFromChannelModal/>
                    <ResetStatusModal/>
                    <LeavePrivateChannelModal/>
                    <ShortcutsModal isMac={Utils.isMac()}/>
                    <ModalController/>
                </div>
            </div>
        );
    }
}
