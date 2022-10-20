// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {RequestStatus} from 'mattermost-redux/constants';

import {loadStatusesForChannelAndSidebar} from 'actions/status_actions';

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

import {shouldShowAppBar} from 'selectors/plugins';

import {GlobalState} from 'types/store';

import {Constants} from 'utils/constants';
import {isInternetExplorer, isEdge} from 'utils/user_agent';

const BODY_CLASS_FOR_CHANNEL = ['app__body', 'channel-view'];

export default function ChannelController() {
    const dispatch = useDispatch<DispatchFunc>();

    const shouldRenderCenterChannel = useSelector((state: GlobalState) =>
        state.requests.channels.getChannelsMembersCategories.status === RequestStatus.SUCCESS);

    const isAppBarEnabled = useSelector(shouldShowAppBar);

    useEffect(() => {
        const isMsBrowser = isInternetExplorer() || isEdge();
        const platform = window.navigator.platform;
        document.body.classList.add(...getClassnamesForBody(platform, isMsBrowser));

        return () => {
            document.body.classList.remove(...BODY_CLASS_FOR_CHANNEL);
        };
    }, []);

    useEffect(() => {
        const loadStatusesIntervalId = setInterval(() => {
            dispatch(loadStatusesForChannelAndSidebar());
        }, Constants.STATUS_INTERVAL);

        return () => {
            clearInterval(loadStatusesIntervalId);
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
            <div className={classNames('container-fluid channel-view-inner', {'app-bar-enabled': isAppBarEnabled})}>
                <SidebarRight/>
                <SidebarRightMenu/>
                <Sidebar/>
                {shouldRenderCenterChannel ? <CenterChannel/> : <LoadingScreen/>}
                <Pluggable pluggableName='Root'/>
                <ResetStatusModal/>
            </div>
            <AppBar/>
        </div>
    );
}

export function getClassnamesForBody(platform: Window['navigator']['platform'], isMsBrowser = false) {
    const bodyClass = [...BODY_CLASS_FOR_CHANNEL];

    // OS Detection
    if (platform === 'Win32' || platform === 'Win64') {
        bodyClass.push('os--windows');
    } else if (platform === 'MacIntel' || platform === 'MacPPC') {
        bodyClass.push('os--mac');
    }

    // IE Detection
    if (isMsBrowser) {
        bodyClass.push('browser--ie');
    }

    return bodyClass;
}
