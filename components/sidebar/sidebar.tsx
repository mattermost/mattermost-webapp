// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {ChannelType} from 'mattermost-redux/types/channels';

import {trackEvent} from 'actions/diagnostics_actions';
import EditCategoryModal from 'components/edit_category_modal';
import MoreDirectChannels from 'components/more_direct_channels';
import MoreChannels from 'components/more_channels';
import NewChannelFlow from 'components/new_channel_flow';
import Pluggable from 'plugins/pluggable';
import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils';

import AddChannelDropdown from './add_channel_dropdown';
import SidebarHeader from './sidebar_header';
import ChannelNavigator from './channel_navigator';
import ChannelFilter from './channel_filter';
import SidebarCategoryList from './sidebar_category_list';

type Props = {
    teamId: string;
    canCreatePublicChannel: boolean;
    canCreatePrivateChannel: boolean;
    canJoinPublicChannel: boolean;
    isOpen: boolean;
    actions: {
        createCategory: (teamId: string, categoryName: string) => {data: string};
    };
};

type State = {
    showDirectChannelsModal: boolean;
    showMoreChannelsModal: boolean;
    showNewChannelModal: boolean;
    showCreateCategoryModal: boolean;
    newCategoryIds: string[];
};

export default class Sidebar extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showDirectChannelsModal: false,
            showMoreChannelsModal: false,
            showNewChannelModal: false,
            showCreateCategoryModal: false,
            newCategoryIds: [],
        };
    }

    showMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: true});
        trackEvent('ui', 'ui_channels_more_direct_v2');
    }

    hideMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: false});
    }

    showCreateCategoryModal = () => {
        this.setState({showCreateCategoryModal: true});
    }

    hideCreateCategoryModal = () => {
        this.setState({showCreateCategoryModal: false});
    }

    handleCreateCategory = (categoryName: string) => {
        const result = this.props.actions.createCategory(this.props.teamId, categoryName);
        this.state.newCategoryIds.push(result.data);
    }

    showMoreChannelsModal = () => {
        this.setState({showMoreChannelsModal: true});
        trackEvent('ui', 'ui_channels_more_public_v2');
    }

    hideMoreChannelsModal = () => {
        this.setState({showMoreChannelsModal: false});
    }

    showNewChannelModal = () => {
        this.setState({showNewChannelModal: true});
        trackEvent('ui', 'ui_channels_create_channel_v2');
    }

    hideNewChannelModal = () => {
        this.setState({showNewChannelModal: false});
    }

    handleOpenMoreDirectChannelsModal = (e: Event) => {
        e.preventDefault();
        if (this.state.showDirectChannelsModal) {
            this.hideMoreDirectChannelsModal();
        } else {
            this.showMoreDirectChannelsModal();
        }
    }

    handleNewChannelForMoreChannelsModal = () => {
        this.hideMoreChannelsModal();
        this.showNewChannelModal();
    }

    renderModals = () => {
        let moreDirectChannelsModal;
        if (this.state.showDirectChannelsModal) {
            moreDirectChannelsModal = (
                <MoreDirectChannels
                    onModalDismissed={this.hideMoreDirectChannelsModal}
                    isExistingChannel={false}
                />
            );
        }

        let moreChannelsModal;
        if (this.state.showMoreChannelsModal) {
            moreChannelsModal = (
                <MoreChannels
                    onModalDismissed={this.hideMoreChannelsModal}
                    handleNewChannel={this.handleNewChannelForMoreChannelsModal}
                    morePublicChannelsModalType={'public'} // TODO: need to incorporate 'private' when showing archived channels: (getConfig(state).ExperimentalViewArchivedChannels === 'true')
                />
            );
        }

        let createCategoryModal;
        if (this.state.showCreateCategoryModal) {
            createCategoryModal = (
                <EditCategoryModal
                    onHide={this.hideCreateCategoryModal}
                    editCategory={this.handleCreateCategory}
                    modalHeaderText={Utils.localizeMessage('create_category_modal.createCategory', 'Create Category')}
                    editButtonText={Utils.localizeMessage('create_category_modal.create', 'Create')}
                />
            );
        }

        return (
            <React.Fragment>
                <NewChannelFlow
                    show={this.state.showNewChannelModal}
                    canCreatePublicChannel={this.props.canCreatePublicChannel}
                    canCreatePrivateChannel={this.props.canCreatePrivateChannel}
                    channelType={Constants.OPEN_CHANNEL as ChannelType}
                    onModalDismissed={this.hideNewChannelModal}
                />
                {moreDirectChannelsModal}
                {moreChannelsModal}
                {createCategoryModal}
            </React.Fragment>
        );
    }

    render() {
        return (
            <div
                id='SidebarContainer'
                className={classNames({
                    'move--right': this.props.isOpen && Utils.isMobile(),
                })}
            >
                <SidebarHeader/>
                <div
                    className='a11y__region'
                    data-a11y-sort-order='6'
                >
                    <ChannelNavigator/>
                    <div className='SidebarContainer_filterAddChannel'>
                        <ChannelFilter/>
                        <AddChannelDropdown
                            showNewChannelModal={this.showNewChannelModal}
                            showMoreChannelsModal={this.showMoreChannelsModal}
                            showCreateCategoryModal={this.showCreateCategoryModal}
                            canCreateChannel={this.props.canCreatePrivateChannel || this.props.canCreatePublicChannel}
                            canJoinPublicChannel={this.props.canJoinPublicChannel}
                        />
                    </div>
                </div>
                <Pluggable pluggableName='LeftSidebarHeader'/>
                <SidebarCategoryList
                    handleOpenMoreDirectChannelsModal={this.handleOpenMoreDirectChannelsModal}
                    newCategoryIds={this.state.newCategoryIds}
                />
                {this.renderModals()}
            </div>
        );
    }
}
