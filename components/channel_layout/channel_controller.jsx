// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';

import Pluggable from 'plugins/pluggable';
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
import TeamSidebar from 'components/team_sidebar';
import ChannelView from 'components/channel_view';
import PermalinkView from 'components/permalink_view';
import MessageIdentifierRouter from 'components/message_indentifier_router';
import Sidebar from 'components/sidebar';
import * as Utils from 'utils/utils';
import ChannelStore from '../../stores/channel_store';
import TeamStore from '../../stores/team_store';
import BrowserStore from '../../stores/browser_store';
import Constants from '../../utils/constants';

export default class ChannelController extends React.PureComponent {
    static propTypes = {
        matchUrl: PropTypes.string.isRequired,
        teamId: PropTypes.string.isRequired,
        teamType: PropTypes.string.isRequired
    };

    toLastChannel = () => {
        let channelName = Constants.DEFAULT_CHANNEL;
        const team = TeamStore.getByName(this.props.teamId);
        const channelId = BrowserStore.getGlobalItem(team.id);
        const channel = ChannelStore.getChannelById(channelId);

        if (channel) {
            channelName = channel.name;
        }
        return `${this.props.matchUrl}/channels/${channelName}`;
    };

    render() {
        const {matchUrl, teamType} = this.props;
        return (
            <div className='channel-view'>
                <AnnouncementBar/>
                <WebrtcNotification/>
                <div className='container-fluid'>
                    <SidebarRight/>
                    <SidebarRightMenu teamType={teamType}/>
                    <WebrtcSidebar/>
                    <Route component={TeamSidebar}/>
                    <Route component={Sidebar}/>
                    <div
                        id='inner-wrap-webrtc'
                        key='inner-wrap'
                        className='inner-wrap channel__wrap'
                        style={{border: '10px solid red'}}
                    >
                        <div className='row header'>
                            <div id='navbar'>
                                <Navbar/>
                            </div>
                        </div>
                        <div className='row main'>
                            <Switch>
                                <Route
                                    path={`${matchUrl}/channels/:channel`}
                                    component={ChannelView}
                                />
                                <Route
                                    path={`${matchUrl}/pl/:postid`}
                                    component={PermalinkView}
                                />
                                <Route
                                    path={'/:team/messages/:identifier'}
                                    component={MessageIdentifierRouter}
                                />
                                <Redirect to={this.toLastChannel()}/>
                            </Switch>
                        </div>
                    </div>

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
        )
    }
}
