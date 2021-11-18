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
import InvitationModal from 'components/invitation_modal';

import Pluggable from 'plugins/pluggable';

import {ModalData} from 'types/actions';

import Constants, {ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils';

import KeyboardShortcutsModal from '../keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal';

import ChannelNavigator from './channel_navigator';
import SidebarChannelList from './sidebar_channel_list';
import SidebarHeader from './sidebar_header';
import LegacySidebarHeader from './legacy_sidebar_header';
import SidebarNextSteps from './sidebar_next_steps';

type Props = {
    teamId: string;
    canCreatePublicChannel: boolean;
    canCreatePrivateChannel: boolean;
    canJoinPublicChannel: boolean;
    isOpen: boolean;
    hasSeenModal: boolean;
    actions: {
        fetchMyCategories: (teamId: string) => {data: boolean};
        createCategory: (teamId: string, categoryName: string) => {data: string};
        openModal: <P>(modalData: ModalData<P>) => void;
        clearChannelSelection: () => void;
    };
    isCloud: boolean;
    unreadFilterEnabled: boolean;
    isMobileView: boolean;
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

        window.addEventListener('click', this.handleClickClearChannelSelection);
        window.addEventListener('keydown', this.handleKeyDownEvent);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.teamId && prevProps.teamId !== this.props.teamId) {
            this.props.actions.fetchMyCategories(this.props.teamId);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleClickClearChannelSelection);
        window.removeEventListener('keydown', this.handleKeyDownEvent);
    }

    handleClickClearChannelSelection = (event: MouseEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        this.props.actions.clearChannelSelection();
    }

    handleKeyDownEvent = (event: KeyboardEvent) => {
        if (Utils.isKeyPressed(event, Constants.KeyCodes.ESCAPE)) {
            this.props.actions.clearChannelSelection();
            return;
        }
        const ctrlOrMetaKeyPressed = event.ctrlKey || event.metaKey;
        const shortcutModalKeyCombo = ctrlOrMetaKeyPressed && Utils.isKeyPressed(event, Constants.KeyCodes.FORWARD_SLASH);
        if (shortcutModalKeyCombo) {
            event.preventDefault();
            this.props.actions.openModal({
                modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL,
                dialogType: KeyboardShortcutsModal,
            });
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

    invitePeopleModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.INVITATION,
            dialogType: InvitationModal,
        });
        trackEvent('ui', 'ui_channels_dropdown_invite_people');
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

        const ariaLabel = Utils.localizeMessage('accessibility.sections.lhsNavigator', 'channel navigator region');

        return (
            <div
                id='SidebarContainer'
                className={classNames({
                    'move--right': this.props.isOpen && this.props.isMobileView,
                    dragging: this.state.isDragging,
                })}
            >
                {this.props.isMobileView ? <LegacySidebarHeader/> : (
                    <SidebarHeader
                        showNewChannelModal={this.showNewChannelModal}
                        showMoreChannelsModal={this.showMoreChannelsModal}
                        invitePeopleModal={this.invitePeopleModal}
                        showCreateCategoryModal={this.showCreateCategoryModal}
                        canCreateChannel={this.props.canCreatePrivateChannel || this.props.canCreatePublicChannel}
                        canJoinPublicChannel={this.props.canJoinPublicChannel}
                        handleOpenDirectMessagesModal={this.handleOpenMoreDirectChannelsModal}
                        unreadFilterEnabled={this.props.unreadFilterEnabled}
                    />
                )}
                <div
                    id='lhsNavigator'
                    role='application'
                    aria-label={ariaLabel}
                    className='a11y__region'
                    data-a11y-sort-order='6'
                >
                    <ChannelNavigator
                        showNewChannelModal={this.showNewChannelModal}
                        showMoreChannelsModal={this.showMoreChannelsModal}
                        invitePeopleModal={this.invitePeopleModal}
                        showCreateCategoryModal={this.showCreateCategoryModal}
                        canCreateChannel={this.props.canCreatePrivateChannel || this.props.canCreatePublicChannel}
                        canJoinPublicChannel={this.props.canJoinPublicChannel}
                        handleOpenDirectMessagesModal={this.handleOpenMoreDirectChannelsModal}
                        unreadFilterEnabled={this.props.unreadFilterEnabled}
                    />
                </div>
                <div className='sidebar--left__icons'>
                    <Pluggable pluggableName='LeftSidebarHeader'/>
                </div>
                <SidebarChannelList
                    handleOpenMoreDirectChannelsModal={this.handleOpenMoreDirectChannelsModal}
                    onDragStart={this.onDragStart}
                    onDragEnd={this.onDragEnd}
                />
                <DataPrefetch/>
                <SidebarNextSteps/>
                {this.renderModals()}
            </div>
        );
    }
}
