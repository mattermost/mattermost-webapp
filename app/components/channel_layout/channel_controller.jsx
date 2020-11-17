// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';

import AnnouncementBarController from 'components/announcement_bar';

import Pluggable from 'plugins/pluggable';
import SystemNotice from 'components/system_notice';
import EditPostModal from 'components/edit_post_modal';

import GetPublicLinkModal from 'components/get_public_link_modal';
import LeavePrivateChannelModal from 'components/leave_private_channel_modal';
import ResetStatusModal from 'components/reset_status_modal';
import ShortcutsModal from 'components/shortcuts_modal.jsx';
import SidebarRight from 'components/sidebar_right';
import SidebarRightMenu from 'components/sidebar_right_menu';
import ImportThemeModal from 'components/user_settings/import_theme_modal';
import ModalController from 'components/modal_controller';
import LegacyTeamSidebar from 'components/legacy_team_sidebar';
import LegacySidebar from 'components/legacy_sidebar';
import Sidebar from 'components/sidebar';
import * as Utils from 'utils/utils';
import * as UserAgent from 'utils/user_agent';
import CenterChannel from 'components/channel_layout/center_channel';
import LoadingScreen from 'components/loading_screen';
import FaviconTitleHandler from 'components/favicon_title_handler';
import ProductNoticesModal from 'components/product_notices_modal';

export default class ChannelController extends React.Component {
    static propTypes = {
        pathName: PropTypes.string.isRequired,
        teamType: PropTypes.string.isRequired,
        fetchingChannels: PropTypes.bool.isRequired,
        useLegacyLHS: PropTypes.bool.isRequired,
    };

    shouldComponentUpdate(nextProps) {
        return this.props.teamType !== nextProps.teamType || this.props.pathName !== nextProps.pathName || this.props.fetchingChannels !== nextProps.fetchingChannels || this.props.useLegacyLHS !== nextProps.useLegacyLHS;
    }

    componentDidMount() {
        const platform = window.navigator.platform;

        document.body.classList.add('app__body', 'channel-view');

        // IE Detection
        if (UserAgent.isInternetExplorer() || UserAgent.isEdge()) {
            document.body.classList.add('browser--ie');
        }

        // OS Detection
        if (platform === 'Win32' || platform === 'Win64') {
            document.body.classList.add('os--windows');
        } else if (platform === 'MacIntel' || platform === 'MacPPC') {
            document.body.classList.add('os--mac');
        }
    }

    componentWillUnmount() {
        document.body.classList.remove('app__body', 'channel-view');
    }

    render() {
        const PreferredTeamSidebar = LegacyTeamSidebar; // TODO: Replace with switch when we rewrite team sidebar
        const PreferredSidebar = this.props.useLegacyLHS ? LegacySidebar : Sidebar;

        return (
            <div
                id='channel_view'
                className='channel-view'
            >
                <AnnouncementBarController/>
                <SystemNotice/>
                <FaviconTitleHandler/>
                <ProductNoticesModal/>
                <div className='container-fluid'>
                    <SidebarRight/>
                    <SidebarRightMenu teamType={this.props.teamType}/>
                    <Route component={PreferredTeamSidebar}/>
                    <Route component={PreferredSidebar}/>
                    {!this.props.fetchingChannels && <Route component={CenterChannel}/>}
                    {this.props.fetchingChannels && <LoadingScreen/>}
                    <Pluggable pluggableName='Root'/>
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
