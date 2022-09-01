// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import classNames from 'classnames';

import AnnouncementBarController from 'components/announcement_bar';
import SystemNotice from 'components/system_notice';
import ResetStatusModal from 'components/reset_status_modal';
import SidebarRight from 'components/sidebar_right';
import SidebarRightMenu from 'components/sidebar_right_menu';
import AppBar from 'components/app_bar/app_bar';
import Sidebar from 'components/sidebar';
import CenterChannel from 'components/channel_layout/center_channel';
import LoadingScreen from 'components/loading_screen';
import FaviconTitleHandler from 'components/favicon_title_handler';
import ProductNoticesModal from 'components/product_notices_modal';

import Pluggable from 'plugins/pluggable';

import {isInternetExplorer, isEdge} from 'utils/user_agent';

interface Props {
    shouldShowAppBar: boolean;
    isFetchingChannels: boolean;
}

export default function ChannelController({shouldShowAppBar, isFetchingChannels}: Props) {
    useEffect(() => {
        document.body.classList.add('app__body', 'channel-view');

        // IE Detection
        if (isInternetExplorer() || isEdge()) {
            document.body.classList.add('browser--ie');
        }

        const platform = window.navigator.platform;

        // OS Detection
        if (platform === 'Win32' || platform === 'Win64') {
            document.body.classList.add('os--windows');
        } else if (platform === 'MacIntel' || platform === 'MacPPC') {
            document.body.classList.add('os--mac');
        }

        return () => {
            document.body.classList.remove('app__body', 'channel-view');
        };
    }, []);

    return (
        <div
            id='channel_view'
            className='channel-view'
        >
            <AnnouncementBarController/>
            <SystemNotice/>
            <FaviconTitleHandler/>
            <ProductNoticesModal/>
            <div className={classNames('container-fluid channel-view-inner', {'app-bar-enabled': shouldShowAppBar})}>
                <SidebarRight/>
                <SidebarRightMenu/>
                <Sidebar/>
                {isFetchingChannels ? <LoadingScreen/> : <CenterChannel/>}
                <Pluggable pluggableName='Root'/>
                <ResetStatusModal/>
            </div>
            <AppBar/>
        </div>
    );
}
