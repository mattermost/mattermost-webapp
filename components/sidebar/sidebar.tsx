// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Pluggable from 'plugins/pluggable';

import MoreDirectChannels from 'components/more_direct_channels';
import MoreChannels from 'components/more_channels';

import {Constants} from 'utils/constants';

import SidebarHeader from './sidebar_header';
import ChannelNavigator from './channel_navigator';
import ChannelFilter from './channel_filter';
import SidebarCategoryList from './sidebar_category_list';

type Props = {

};

type State = {
    showDirectChannelsModal: boolean;
    showMoreChannelsModal: boolean;
};

export default class Sidebar extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showDirectChannelsModal: false,
            showMoreChannelsModal: false,
        };
    }

    onHideMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: false});
    }

    onHideMoreChannelsModal = () => {
        this.setState({showMoreChannelsModal: false});
    }

    renderModals = () => {
        let moreDirectChannelsModal;
        if (this.state.showDirectChannelsModal) {
            moreDirectChannelsModal = (
                <MoreDirectChannels
                    onModalDismissed={this.onHideMoreDirectChannelsModal}
                    isExistingChannel={false}
                />
            );
        }

        let moreChannelsModal;
        if (this.state.showMoreChannelsModal) {
            moreChannelsModal = (
                <MoreChannels
                    onModalDismissed={this.onHideMoreChannelsModal}
                    handleNewChannel={() => {
                        this.onHideMoreChannelsModal();
                        this.showNewChannelModal(Constants.OPEN_CHANNEL);
                    }}
                    morePublicChannelsModalType={this.state.morePublicChannelsModalType}
                />
            );
        }

        return (
            <React.Fragment>
                <NewChannelFlow
                    show={this.state.showNewChannelModal}
                    canCreatePublicChannel={this.props.canCreatePublicChannel}
                    canCreatePrivateChannel={this.props.canCreatePrivateChannel}
                    channelType={this.state.newChannelModalType}
                    onModalDismissed={this.hideNewChannelModal}
                />
                {moreDirectChannelsModal}
                {moreChannelsModal}
            </React.Fragment>
        );
    }

    render() {
        return (
            <div className='sidebar--left'>
                <SidebarHeader/>
                <ChannelNavigator/>
                <ChannelFilter/>
                <Pluggable/>
                <SidebarCategoryList/>
                {this.renderModals()}
            </div>
        );
    }
}
