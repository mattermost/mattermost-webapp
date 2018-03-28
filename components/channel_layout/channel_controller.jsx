// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';

import Pluggable from 'plugins/pluggable';
import AnnouncementBar from 'components/announcement_bar';
import EditPostModal from 'components/edit_post_modal';
import GetPostLinkModal from 'components/get_post_link_modal';
import GetTeamInviteLinkModal from 'components/get_team_invite_link_modal';
import GetPublicLinkModal from 'components/get_public_link_modal';
import InviteMemberModal from 'components/invite_member_modal';
import LeaveTeamModal from 'components/leave_team_modal.jsx';
import LeavePrivateChannelModal from 'components/modals/leave_private_channel_modal.jsx';
import RemovedFromChannelModal from 'components/removed_from_channel_modal.jsx';
import ResetStatusModal from 'components/reset_status_modal';
import ShortcutsModal from 'components/shortcuts_modal.jsx';
import SidebarRight from 'components/sidebar_right';
import SidebarRightMenu from 'components/sidebar_right_menu';
import TeamSettingsModal from 'components/team_settings_modal.jsx';
import ImportThemeModal from 'components/user_settings/import_theme_modal.jsx';
import UserSettingsModal from 'components/user_settings/modal';
import WebrtcNotification from 'components/webrtc/notification';
import WebrtcSidebar from 'components/webrtc/sidebar';
import ModalController from 'components/modal_controller';
import TeamSidebar from 'components/team_sidebar';
import Sidebar from 'components/sidebar';
import * as Utils from 'utils/utils';
import CenterChannel from 'components/channel_layout/center_channel';

export default class ChannelController extends React.Component {
    static propTypes = {
        pathName: PropTypes.string.isRequired,
        teamType: PropTypes.string.isRequired,
    };

    shouldComponentUpdate(nextProps) {
        return this.props.teamType !== nextProps.teamType || this.props.pathName !== nextProps.pathName;
    }

    render() {
        return (
            <div className='channel-view'>
                <AnnouncementBar/>
                <WebrtcNotification/>

                <div className='container-fluid'>
                    <SidebarRight/>
                    <SidebarRightMenu teamType={this.props.teamType}/>
                    <WebrtcSidebar/>
                    <Route component={TeamSidebar}/>
                    <Route component={Sidebar}/>
                    <Route component={CenterChannel}/>
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
