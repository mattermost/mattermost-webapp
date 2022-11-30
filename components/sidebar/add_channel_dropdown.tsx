// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {CreateAndJoinChannelsTour, InvitePeopleTour} from 'components/tours/onboarding_tour';
import NewChannelModal from 'components/new_channel_modal/new_channel_modal';
import CreateUserGroupsModal from 'components/create_user_groups_modal';

import { A11yCustomEventTypes, A11yFocusEventDetail, ModalIdentifiers } from 'utils/constants';
import MoreChannels from 'components/more_channels';
import EditCategoryModal from 'components/edit_category_modal';
import InvitationModal from 'components/invitation_modal';
import MoreDirectChannels from 'components/more_direct_channels';

type Props = {
    canCreateChannel: boolean;
    canJoinPublicChannel: boolean;
    userGroupsEnabled: boolean;
    unreadFilterEnabled: boolean;
    showCreateTutorialTip: boolean;
    showInviteTutorialTip: boolean;
    isAddChannelOpen: boolean;
    openAddChannelOpen: (open: boolean) => void;
    canCreateCustomGroups: boolean;
};

const AddChannelDropdown = ({
    canCreateChannel,
    canJoinPublicChannel,
    handleOpenDirectMessagesModal,
    unreadFilterEnabled,
    showCreateTutorialTip,
    showInviteTutorialTip,
    isAddChannelOpen,
    openAddChannelOpen,
    canCreateCustomGroups,
}: Props) => {
    const intl = useIntl();
    const dispatch = useDispatch();

    const fallbackFocus = document.activeElement;

    const returnFocus = () => {
        console.log(fallbackFocus);
        document.dispatchEvent(new CustomEvent<A11yFocusEventDetail>(
            A11yCustomEventTypes.FOCUS, {
                detail: {
                    target: fallbackFocus as HTMLElement,
                    keyboardOnly: true,
                },
            },
        ));
    };

    const openNewChannelModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.NEW_CHANNEL_MODAL,
            dialogType: NewChannelModal,
            dialogProps: {
                returnFocus,
            },
        }));
        trackEvent('ui', 'ui_channels_create_channel_v2');
    }

    const showCreateUserGroupModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.USER_GROUPS_CREATE,
            dialogType: CreateUserGroupsModal,
            dialogProps: {
                returnFocus,
            },
        }));
        trackEvent('ui', 'ui_channels_create_user_group');
    }

    const showMoreChannelsModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.MORE_CHANNELS,
            dialogType: MoreChannels,
            dialogProps: {
                morePublicChannelsModalType: 'public',
                returnFocus,
            },
        }));
        trackEvent('ui', 'ui_channels_more_public_v2');
    }

    const showCreateCategoryModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
            dialogProps: {
                returnFocus,
            },
        }));
        trackEvent('ui', 'ui_sidebar_menu_createCategory');
    }

    const invitePeopleModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.INVITATION,
            dialogType: InvitationModal,
            dialogProps: {
                returnFocus,
            },
        }));
        trackEvent('ui', 'ui_channels_dropdown_invite_people');
    }

    const showDmChannelsModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.MORE_DM_CHANNELS,
            dialogType: MoreDirectChannels,
            dialogProps: {
                isExistingChannel: false,
                returnFocus,
            },
        }));
        trackEvent('ui', 'ui_channels_dropdown_invite_people');
    }

    const renderDropdownItems = () => {
        const invitePeople = (
            <Menu.Group>
                <Menu.ItemAction
                    id='invitePeople'
                    onClick={invitePeopleModal}
                    icon={<i className='icon-account-plus-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.invitePeople', defaultMessage: 'Invite People'})}
                    extraText={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.invitePeopleExtraText', defaultMessage: 'Add people to the team'})}
                />
                {showInviteTutorialTip && <InvitePeopleTour/>}
            </Menu.Group>
        );

        let joinPublicChannel;
        if (canJoinPublicChannel) {
            joinPublicChannel = (
                <Menu.ItemAction
                    id='showMoreChannels'
                    onClick={showMoreChannelsModal}
                    icon={<i className='icon-globe'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.browseChannels', defaultMessage: 'Browse Channels'})}
                />
            );
        }

        let createChannel;
        if (canCreateChannel) {
            createChannel = (
                <Menu.ItemAction
                    id='showNewChannel'
                    onClick={openNewChannelModal}
                    icon={<i className='icon-plus'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.createNewChannel', defaultMessage: 'Create New Channel'})}
                />
            );
        }

        let createCategory;
        if (!unreadFilterEnabled) {
            createCategory = (
                <Menu.Group>
                    <Menu.ItemAction
                        id='createCategory'
                        onClick={showCreateCategoryModal}
                        icon={<i className='icon-folder-plus-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.createCategory', defaultMessage: 'Create New Category'})}
                    />
                </Menu.Group>);
        }

        const createDirectMessage = (
            <Menu.ItemAction
                id={'openDirectMessageMenuItem'}
                onClick={showDmChannelsModal}
                icon={<i className='icon-account-outline'/>}
                text={intl.formatMessage({id: 'sidebar.openDirectMessage', defaultMessage: 'Open a direct message'})}
            />
        );

        let createUserGroup;
        if (canCreateCustomGroups) {
            createUserGroup = (
                <Menu.ItemAction
                    id={'createUserGroup'}
                    onClick={showCreateUserGroupModal}
                    icon={<i className='icon-account-multiple-plus-outline'/>}
                    text={intl.formatMessage({id: 'sidebar.createUserGroup', defaultMessage: 'Create New User Group'})}
                />
            );
        }

        return (
            <>
                <Menu.Group>
                    {joinPublicChannel}
                    {createChannel}
                    {createDirectMessage}
                    {showCreateTutorialTip && <CreateAndJoinChannelsTour/>}
                    {createUserGroup}
                </Menu.Group>
                {createCategory}
                {invitePeople}
            </>
        );
    };

    const trackOpen = (opened: boolean) => {
        openAddChannelOpen(opened);
        if (opened) {
            trackEvent('ui', 'ui_add_channel_dropdown_opened');
        }
    };

    if (!(canCreateChannel || canJoinPublicChannel)) {
        return null;
    }

    const tooltip = (
        <Tooltip
            id='new-group-tooltip'
            className='hidden-xs'
        >
            <FormattedMessage
                id={'sidebar_left.add_channel_dropdown.browseOrCreateChannels'}
                defaultMessage='Browse or create channels'
            />
        </Tooltip>
    );

    return (
        <MenuWrapper
            className='AddChannelDropdown'
            onToggle={trackOpen}
            open={isAddChannelOpen}
        >
            <OverlayTrigger
                delayShow={500}
                placement='top'
                overlay={tooltip}
            >
                <>
                    <button
                        className={'AddChannelDropdown_dropdownButton'}
                        aria-label={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.dropdownAriaLabel', defaultMessage: 'Add Channel Dropdown'})}
                    >
                        <i className='icon-plus'/>
                    </button>
                </>
            </OverlayTrigger>
            <Menu
                id='AddChannelDropdown'
                ariaLabel={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.dropdownAriaLabel', defaultMessage: 'Add Channel Dropdown'})}
            >
                {renderDropdownItems()}
            </Menu>
        </MenuWrapper>
    );
};

export default AddChannelDropdown;
