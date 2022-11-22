// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {CreateAndJoinChannelsTour, InvitePeopleTour} from 'components/tours/onboarding_tour';

type Props = {
    canCreateChannel: boolean;
    canJoinPublicChannel: boolean;
    userGroupsEnabled: boolean;
    showMoreChannelsModal: () => void;
    showCreateUserGroupModal: () => void;
    invitePeopleModal: () => void;
    showNewChannelModal: () => void;
    showCreateCategoryModal: () => void;
    handleOpenDirectMessagesModal: (e: Event) => void;
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
    showMoreChannelsModal,
    showCreateUserGroupModal,
    invitePeopleModal,
    showNewChannelModal,
    showCreateCategoryModal,
    handleOpenDirectMessagesModal,
    unreadFilterEnabled,
    showCreateTutorialTip,
    showInviteTutorialTip,
    isAddChannelOpen,
    openAddChannelOpen,
    canCreateCustomGroups,
}: Props) => {
    const intl = useIntl();

    const renderDropdownItems: Array<{ id: string;
        onClick: (e: Event) => void;
        icon: string;
        text: string;
        shouldShowTourComponent?: boolean;
        tourComponent?: () => JSX.Element;
        divider?: string;
        extraText?: string;
        isEligible: boolean;
    }> = [
        {
            id: 'showMoreChannels',
            onClick: showMoreChannelsModal,
            icon: 'icon-globe',
            text: intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.browseChannels', defaultMessage: 'Browse Channels'}),
            shouldShowTourComponent: showCreateTutorialTip,
            tourComponent: CreateAndJoinChannelsTour,
            isEligible: canJoinPublicChannel,

        },
        {
            id: 'showNewChannel',
            onClick: showNewChannelModal,
            icon: 'icon-plus',
            text: intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.createNewChannel', defaultMessage: 'Create New Channel'}),
            isEligible: canCreateChannel,
        },
        {
            id: 'browseDirectMessages',
            onClick: handleOpenDirectMessagesModal,
            icon: 'icon-account-outline',
            text: intl.formatMessage({id: 'sidebar.openDirectMessage', defaultMessage: 'Open a direct message'}),
            isEligible: true,
        },
        {
            id: 'createUserGroup',
            onClick: showCreateUserGroupModal,
            icon: 'icon-account-multiple-plus-outline',
            text: intl.formatMessage({id: 'sidebar.createUserGroup', defaultMessage: 'Create New User Group'}),
            isEligible: canCreateCustomGroups,
        },
        {
            id: 'createCategory',
            onClick: showCreateCategoryModal,
            icon: 'icon-folder-plus-outline',
            text: intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.createCategory', defaultMessage: 'Create New Category'}),
            divider: 'MenuGroup menu-divider',
            isEligible: !unreadFilterEnabled,
        },
        {
            id: 'invitePeople',
            onClick: invitePeopleModal,
            icon: 'icon-account-plus-outline',
            text: intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.invitePeople', defaultMessage: 'Invite People'}),
            extraText: intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.invitePeopleExtraText', defaultMessage: 'Add people to the team'}),
            shouldShowTourComponent: showInviteTutorialTip,
            tourComponent: InvitePeopleTour,
            divider: 'MenuGroup menu-divider',
            isEligible: true,
        },
    ];

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
                <Menu.Group>
                    {renderDropdownItems.map((item, index, items) => (
                        <Menu.Group
                            key={index}
                            divider={<li className={item.divider}/>}
                        >
                            {item.isEligible &&
                            <Menu.ItemAction
                                id={item.id}
                                onClick={item.onClick}
                                icon={<i className={item.icon}/>}
                                text={item.text}
                                extraText={item.extraText}
                                index={index}
                                size={items.length}
                            />
                            }
                            {item.shouldShowTourComponent && item.tourComponent && <item.tourComponent/>}
                        </Menu.Group>
                    ))}
                </Menu.Group>
            </Menu>
        </MenuWrapper>
    );
};

export default AddChannelDropdown;
