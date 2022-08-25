// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Route} from 'react-router-dom';
import classNames from 'classnames';

import Pluggable from 'plugins/pluggable';

import ResetStatusModal from 'components/reset_status_modal';
import Sidebar from 'components/sidebar';
import * as UserAgent from 'utils/user_agent';
import CenterChannel from 'components/channel_layout/center_channel';
import LoadingScreen from 'components/loading_screen';
import FaviconTitleHandler from 'components/favicon_title_handler';
import ProductNoticesModal from 'components/product_notices_modal';

interface Props {
    fetchingChannels: boolean;
}

export default class ChannelController extends React.PureComponent<Props> {
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
        return (
            <>
                <Sidebar/>
                <div
                    id='channel_view'
                    className='channel-view'
                >
                    <FaviconTitleHandler/>
                    <ProductNoticesModal/>
                    <div className={classNames('container-fluid channel-view-inner')}>
                        {!this.props.fetchingChannels && <Route component={CenterChannel}/>}
                        {this.props.fetchingChannels && <LoadingScreen/>}
                        <Pluggable pluggableName='Root'/>
                        <ResetStatusModal/>
                    </div>
                </div>
            </>
        );
    }
}
