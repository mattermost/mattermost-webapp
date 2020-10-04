// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {trackEvent} from 'actions/telemetry_actions';
import EditCategoryModal from 'components/edit_category_modal';
import MoreDirectChannels from 'components/more_direct_channels';
import DataPrefetch from 'components/data_prefetch';
import MoreChannels from 'components/more_channels';
import NewChannelFlow from 'components/new_channel_flow';
import Pluggable from 'plugins/pluggable';
import {ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils';

import AddChannelDropdown from './add_channel_dropdown';
import SidebarHeader from './sidebar_header';
import ChannelNavigator from './channel_navigator';
import ChannelFilter from './channel_filter';
import SidebarCategoryList from './sidebar_category_list';
import SidebarNextSteps from './sidebar_next_steps';
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
    isCloud: boolean;
};

type State = {
    showDirectChannelsModal: boolean;
    isDragging: boolean;
};

export default class Sidebar extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showDirectChannelsModal: false,
            isDragging: false,
        };
    }

    componentDidMount() {
        if (this.props.teamId) {
            this.props.actions.fetchMyCategories(this.props.teamId);
        }

        if (!this.props.hasSeenModal && !this.props.isCloud) {
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
        this.props.actions.openModal({
            modalId: ModalIdentifiers.MORE_CHANNELS,
            dialogType: MoreChannels,
            dialogProps: {morePublicChannelsModalType: 'public'},
        });
        trackEvent('ui', 'ui_channels_more_public_v2');
    }

    showNewChannelModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.NEW_CHANNEL_FLOW,
            dialogType: NewChannelFlow,
        });
        trackEvent('ui', 'ui_channels_create_channel_v2');
    }

    handleOpenMoreDirectChannelsModal = (e: Event) => {
        e.preventDefault();
        if (this.state.showDirectChannelsModal) {
            this.hideMoreDirectChannelsModal();
        } else {
            this.showMoreDirectChannelsModal();
        }
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

        return (
            <React.Fragment>
                {moreDirectChannelsModal}
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
                {this.props.isCloud && <SidebarNextSteps/>}
                {this.renderModals()}
            </div>
        );
    }
}
