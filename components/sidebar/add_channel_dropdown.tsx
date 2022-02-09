// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useLayoutEffect, useRef, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import CreateAndJoinChannelsTour from 'components/onboarding_tour/create_and_join_channels_tour_tip';
import InvitePeopleTour from 'components/onboarding_tour/invite_people_tour_tip';

type Props = {
    canCreateChannel: boolean;
    canJoinPublicChannel: boolean;
    showMoreChannelsModal: () => void;
    invitePeopleModal: () => void;
    showNewChannelModal: () => void;
    showCreateCategoryModal: () => void;
    handleOpenDirectMessagesModal: (e: Event) => void;
    unreadFilterEnabled: boolean;
    showCreateTutorialTip: boolean;
    showInviteTutorialTip: boolean;
    isAddChannelOpen?: boolean;
};

const AddChannelDropdown = ({
    canCreateChannel,
    canJoinPublicChannel,
    showMoreChannelsModal,
    invitePeopleModal,
    showNewChannelModal,
    showCreateCategoryModal,
    handleOpenDirectMessagesModal,
    unreadFilterEnabled,
    showCreateTutorialTip,
    showInviteTutorialTip,
    isAddChannelOpen,
}: Props) => {
    const intl = useIntl();
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuCtr, setMenuCtr] = useState({});
    const [open, setOpen] = useState(false);

    useLayoutEffect(() => {
        if (menuRef?.current) {
            setMenuCtr(menuRef?.current.getBoundingClientRect());
        }
    }, [menuRef.current, showCreateTutorialTip, showInviteTutorialTip]);

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
                {showInviteTutorialTip && menuCtr !== {} && <InvitePeopleTour/>}
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
                    onClick={showNewChannelModal}
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
                id={'browseDirectMessages'}
                onClick={handleOpenDirectMessagesModal}
                icon={<i className='icon-account-outline'/>}
                text={intl.formatMessage({id: 'sidebar.openDirectMessage', defaultMessage: 'Open a direct message'})}
            />
        );

        return (
            <>
                <Menu.Group>
                    {joinPublicChannel}
                    {createChannel}
                    {createDirectMessage}
                    {showCreateTutorialTip && menuCtr !== {} && <CreateAndJoinChannelsTour/>}
                </Menu.Group>
                {createCategory}
                {invitePeople}
            </>
        );
    };

    const trackOpen = (opened: boolean) => {
        setOpen(opened);
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
            open={isAddChannelOpen || open}
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
            <div ref={menuRef}>
                <Menu
                    id='AddChannelDropdown'
                    ariaLabel={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.dropdownAriaLabel', defaultMessage: 'Add Channel Dropdown'})}
                >
                    {renderDropdownItems()}
                </Menu>
            </div>
        </MenuWrapper>
    );
};

export default AddChannelDropdown;
