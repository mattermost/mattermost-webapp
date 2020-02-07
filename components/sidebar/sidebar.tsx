// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Pluggable from 'plugins/pluggable';

import SidebarHeader from './sidebar_header';
import ChannelNavigator from './channel_navigator';
import ChannelFilter from './channel_filter';
import SidebarCategoryList from './sidebar_category_list';

type Props = {

};

type State = {

};

export default class Sidebar extends React.PureComponent<Props, State> {
    render() {
        return (
            <div className='sidebar--left'>
                <SidebarHeader/>
                <ChannelNavigator/>
                <ChannelFilter/>
                <Pluggable pluggableName='LeftSidebarHeader'/>
                <SidebarCategoryList/>
            </div>
        );
    }
}
