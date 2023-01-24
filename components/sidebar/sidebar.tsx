// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import {Permissions} from 'mattermost-redux/constants';

import {trackEvent} from 'actions/telemetry_actions';
import EditCategoryModal from 'components/edit_category_modal';
import MoreDirectChannels from 'components/more_direct_channels';
import DataPrefetch from 'components/data_prefetch';
import MoreChannels from 'components/more_channels';
import NewChannelModal from 'components/new_channel_modal/new_channel_modal';
import InvitationModal from 'components/invitation_modal';
import UserSettingsModal from 'components/user_settings/modal';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import ToggleModalButton from 'components/toggle_modal_button';

import Pluggable from 'plugins/pluggable';

import {ModalData} from 'types/actions';

import Constants, {ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils';

import CreateUserGroupsModal from 'components/create_user_groups_modal';
import KeyboardShortcutsModal from '../keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal';

import ChannelNavigator from './channel_navigator';
import SidebarList from './sidebar_list';
import SidebarHeader from './sidebar_header';
import MobileSidebarHeader from './mobile_sidebar_header';

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
        closeModal: (modalId: string) => void;
        clearChannelSelection: () => void;
    };
    isCloud: boolean;
    unreadFilterEnabled: boolean;
    isMobileView: boolean;
    isKeyBoardShortcutModalOpen: boolean;
    userGroupsEnabled: boolean;
    canCreateCustomGroups: boolean;
    showInviteButton: boolean;
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

        const ctrlOrMetaKeyPressed = Utils.cmdOrCtrlPressed(event, true);

        if (ctrlOrMetaKeyPressed) {
            if (Utils.isKeyPressed(event, Constants.KeyCodes.FORWARD_SLASH)) {
                event.preventDefault();
                if (this.props.isKeyBoardShortcutModalOpen) {
                    this.props.actions.closeModal(ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL);
                } else {
                    this.props.actions.openModal({
                        modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL,
                        dialogType: KeyboardShortcutsModal,
                    });
                }
            } else if (Utils.isKeyPressed(event, Constants.KeyCodes.A) && event.shiftKey) {
                event.preventDefault();

                this.props.actions.openModal({
                    modalId: ModalIdentifiers.USER_SETTINGS,
                    dialogType: UserSettingsModal,
                    dialogProps: {
                        isContentProductSettings: true,
                    },
                });
            }
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
            modalId: ModalIdentifiers.NEW_CHANNEL_MODAL,
            dialogType: NewChannelModal,
        });
        trackEvent('ui', 'ui_channels_create_channel_v2');
    }

    showCreateUserGroupModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS_CREATE,
            dialogType: CreateUserGroupsModal,
        });
        trackEvent('ui', 'ui_channels_create_user_group');
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
                {this.props.isMobileView ? <MobileSidebarHeader/> : (
                    <SidebarHeader
                        showNewChannelModal={this.showNewChannelModal}
                        showMoreChannelsModal={this.showMoreChannelsModal}
                        showCreateUserGroupModal={this.showCreateUserGroupModal}
                        invitePeopleModal={this.invitePeopleModal}
                        showCreateCategoryModal={this.showCreateCategoryModal}
                        canCreateChannel={this.props.canCreatePrivateChannel || this.props.canCreatePublicChannel}
                        canJoinPublicChannel={this.props.canJoinPublicChannel}
                        handleOpenDirectMessagesModal={this.handleOpenMoreDirectChannelsModal}
                        unreadFilterEnabled={this.props.unreadFilterEnabled}
                        userGroupsEnabled={this.props.userGroupsEnabled}
                        canCreateCustomGroups={this.props.canCreateCustomGroups}
                    />
                )}
                {
                    this.props.showInviteButton && 
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_USER_TO_TEAM, Permissions.INVITE_GUEST]}
                    >
                        <ToggleModalButton
                            ariaLabel={Utils.localizeMessage('sidebar_left.inviteUsers', 'Invite Users')}
                            id='inviteTeammates'
                            className={'btn btn-link invite-teammates'}
                            modalId={ModalIdentifiers.INVITATION}
                            dialogType={InvitationModal}
                            onClick={() => console.log('opening modal')}
                        >
                            <i className='icon-account-plus-outline'/>
                            <FormattedMessage
                                id={'sidebar_left.inviteTeammates'}
                                defaultMessage='Invite teammates'
                            />
                        </ToggleModalButton>
                    </TeamPermissionGate>
                }
                
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
                        showCreateUserGroupModal={this.showCreateUserGroupModal}
                        invitePeopleModal={this.invitePeopleModal}
                        showCreateCategoryModal={this.showCreateCategoryModal}
                        canCreateChannel={this.props.canCreatePrivateChannel || this.props.canCreatePublicChannel}
                        canJoinPublicChannel={this.props.canJoinPublicChannel}
                        handleOpenDirectMessagesModal={this.handleOpenMoreDirectChannelsModal}
                        unreadFilterEnabled={this.props.unreadFilterEnabled}
                        userGroupsEnabled={this.props.userGroupsEnabled}
                    />
                </div>
                <div className='sidebar--left__icons'>
                    <Pluggable pluggableName='LeftSidebarHeader'/>
                </div>
                <SidebarList
                    handleOpenMoreDirectChannelsModal={this.handleOpenMoreDirectChannelsModal}
                    onDragStart={this.onDragStart}
                    onDragEnd={this.onDragEnd}
                />
                <DataPrefetch/>
                {this.renderModals()}
            </div>
        );
    }
}
