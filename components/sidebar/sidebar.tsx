// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {ChannelType} from 'mattermost-redux/types/channels';

import {trackEvent} from 'actions/diagnostics_actions';
import EditCategoryModal from 'components/edit_category_modal';
import MoreDirectChannels from 'components/more_direct_channels';
import DataPrefetch from 'components/data_prefetch';
import MoreChannels from 'components/more_channels';
import NewChannelFlow from 'components/new_channel_flow';
import Pluggable from 'plugins/pluggable';
import {Constants, ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils';

import AddChannelDropdown from './add_channel_dropdown';
import SidebarHeader from './sidebar_header';
import ChannelNavigator from './channel_navigator';
import ChannelFilter from './channel_filter';
import SidebarCategoryList from './sidebar_category_list';
import SidebarWhatsNewModal from './sidebar_whats_new_modal';

type Props = {
    teamId: string;
    canCreatePublicChannel: boolean;
    canCreatePrivateChannel: boolean;
    canJoinPublicChannel: boolean;
    isOpen: boolean;
    isDataPrefechEnabled: boolean;
    hasSeenModal: boolean;
    actions: {
        fetchMyCategories: (teamId: string) => {data: boolean};
        createCategory: (teamId: string, categoryName: string) => {data: string};
        openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => Promise<{
            data: boolean;
        }>;
    };
};

type State = {
    showDirectChannelsModal: boolean;
    showMoreChannelsModal: boolean;
    showNewChannelModal: boolean;
    isDragging: boolean;
};

export default class Sidebar extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showDirectChannelsModal: false,
            showMoreChannelsModal: false,
            showNewChannelModal: false,
            isDragging: false,
        };
    }

    componentDidMount() {
        if (this.props.teamId) {
            this.props.actions.fetchMyCategories(this.props.teamId);
        }

        if (!this.props.hasSeenModal) {
            this.props.actions.openModal({
                modalId: ModalIdentifiers.SIDEBAR_WHATS_NEW_MODAL,
                dialogType: SidebarWhatsNewModal,
            });
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.teamId && prevProps.teamId !== this.props.teamId) {
            this.props.actions.fetchMyCategories(this.props.teamId);
        }
    }

    showMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: true});
        trackEvent('ui', 'ui_channels_more_direct_v2');
    }

    hideMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: false});
    }

    showCreateCategoryModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        });
        trackEvent('ui', 'ui_sidebar_menu_createCategory');
    }

    handleCreateCategory = (categoryName: string) => {
        this.props.actions.createCategory(this.props.teamId, categoryName);
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

    onDragStart = () => {
        this.setState({isDragging: true});
    }

    onDragEnd = () => {
        this.setState({isDragging: false});
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
            </React.Fragment>
        );
    }

    render() {
        if (!this.props.teamId) {
            return (<div/>);
        }

        return (
            <div
                id='SidebarContainer'
                className={classNames({
                    'move--right': this.props.isOpen && Utils.isMobile(),
                    dragging: this.state.isDragging,
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
                    onDragStart={this.onDragStart}
                    onDragEnd={this.onDragEnd}
                />
                {this.props.isDataPrefechEnabled && <DataPrefetch/>}
                {this.renderModals()}
            </div>
        );
    }
}
