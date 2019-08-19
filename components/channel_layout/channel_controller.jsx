// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';

import AnnouncementBarController from 'components/announcement_bar';

import Pluggable from 'plugins/pluggable';
import SystemNotice from 'components/system_notice';
import EditPostModal from 'components/edit_post_modal';
import GetPostLinkModal from 'components/get_post_link_modal';
import GetPublicLinkModal from 'components/get_public_link_modal';
import LeavePrivateChannelModal from 'components/leave_private_channel_modal';
import ResetStatusModal from 'components/reset_status_modal';
import ShortcutsModal from 'components/shortcuts_modal.jsx';
import SidebarRight from 'components/sidebar_right';
import SidebarRightMenu from 'components/sidebar_right_menu';
import ImportThemeModal from 'components/user_settings/import_theme_modal.jsx';
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
            <div
                id='channel_view'
                className='channel-view'
            >
                <AnnouncementBarController/>
                <SystemNotice/>

                <div className='container-fluid'>
                    <SidebarRight/>
                    <SidebarRightMenu teamType={this.props.teamType}/>
                    <Route component={TeamSidebar}/>
                    <Route component={Sidebar}/>
                    <Route component={CenterChannel}/>
                    <Pluggable pluggableName='Root'/>
                    <GetPostLinkModal/>
                    <GetPublicLinkModal/>
                    <ImportThemeModal/>
                    <EditPostModal/>
                    <ResetStatusModal/>
                    <LeavePrivateChannelModal/>
                    <ShortcutsModal isMac={Utils.isMac()}/>
                    <ModalController/>
                </div>
            </div>
        );
    }
}
