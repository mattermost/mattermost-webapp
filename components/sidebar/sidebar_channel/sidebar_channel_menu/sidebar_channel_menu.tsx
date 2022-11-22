// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, MouseEvent, memo} from 'react';
import {useIntl} from 'react-intl';

import {
    MarkAsUnreadIcon,
    StarIcon,
    StarOutlineIcon,
    BellOutlineIcon,
    BellOffOutlineIcon,
    LinkVariantIcon,
    AccountOutlineIcon,
    CloseIcon,
    DotsVerticalIcon,
} from '@mattermost/compass-icons/components';

import {trackEvent} from 'actions/telemetry_actions';

import ChannelMoveToSubmenu from 'components/channel_move_to_submenu';
import ChannelInviteModal from 'components/channel_invite_modal';
import {Menu, MenuItem, MenuDivider} from 'components/menu';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {copyToClipboard} from 'utils/utils';

import type {PropsFromRedux, OwnProps} from './index';

type Props = PropsFromRedux & OwnProps;

const SidebarChannelMenu = (props: Props) => {
    const isLeaving = useRef(false);

    const {formatMessage} = useIntl();

    let markAsReadUnreadMenuItem: JSX.Element | null = null;
    if (props.isUnread) {
        function handleMarkAsRead(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            props.markChannelAsRead(props.channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_markAsRead');
        }

        markAsReadUnreadMenuItem = (
            <MenuItem
                id={`markAsRead-${props.channel.id}`}
                onClick={handleMarkAsRead}
            >
                <MarkAsUnreadIcon
                    size={16}
                    color='currentColor'
                />
                {formatMessage({id: 'sidebar_left.sidebar_channel_menu.markAsRead', defaultMessage: 'Mark as Read'})}
            </MenuItem>

        );
    } else {
        function handleMarkAsUnread(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            props.markMostRecentPostInChannelAsUnread(props.channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_markAsUnread');
        }

        markAsReadUnreadMenuItem = (
            <MenuItem
                id={`markAsUnread-${props.channel.id}`}
                onClick={handleMarkAsUnread}
            >
                <MarkAsUnreadIcon
                    size={16}
                    color='currentColor'
                />
                {formatMessage({id: 'sidebar_left.sidebar_channel_menu.markAsUnread', defaultMessage: 'Mark as Unread'})}
            </MenuItem>
        );
    }

    let favoriteUnfavoriteMenuItem: JSX.Element | null = null;
    if (props.isFavorite) {
        function handleUnfavoriteChannel(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            props.unfavoriteChannel(props.channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_unfavorite');
        }

        favoriteUnfavoriteMenuItem = (
            <MenuItem
                id={`unfavorite-${props.channel.id}`}
                onClick={handleUnfavoriteChannel}
            >
                <StarIcon
                    size={16}
                    color='currentColor'
                />
                {formatMessage({id: 'sidebar_left.sidebar_channel_menu.unfavorite', defaultMessage: 'Remove from Favorites'})}
            </MenuItem>
        );
    } else {
        function handleFavoriteChannel(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            props.favoriteChannel(props.channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_favorite');
        }

        favoriteUnfavoriteMenuItem = (
            <MenuItem
                id={`favorite-${props.channel.id}`}
                onClick={handleFavoriteChannel}
            >
                <StarOutlineIcon
                    size={16}
                    color='currentColor'
                />
                {formatMessage({id: 'sidebar_left.sidebar_channel_menu.favorite', defaultMessage: 'Add to Favorites'})}
            </MenuItem>
        );
    }

    let muteUnmuteChannelMenuItem: JSX.Element | null = null;
    if (props.isMuted) {
        let muteChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteChannel', defaultMessage: 'Unmute Channel'});
        if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
            muteChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteConversation', defaultMessage: 'Unmute Conversation'});
        }

        function handleUnmuteChannel(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            props.unmuteChannel(props.currentUserId, props.channel.id);
        }

        muteUnmuteChannelMenuItem = (
            <MenuItem
                id={`unmute-${props.channel.id}`}
                onClick={handleUnmuteChannel}
            >
                <BellOffOutlineIcon
                    size={16}
                    color='currentColor'
                />
                {muteChannelText}
            </MenuItem>
        );
    } else {
        let muteChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteChannel', defaultMessage: 'Mute Channel'});
        if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
            muteChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteConversation', defaultMessage: 'Mute Conversation'});
        }

        function handleMuteChannel(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            props.muteChannel(props.currentUserId, props.channel.id);
        }

        muteUnmuteChannelMenuItem = (
            <MenuItem
                id={`mute-${props.channel.id}`}
                onClick={handleMuteChannel}
            >
                <BellOutlineIcon
                    size={16}
                    color='currentColor'
                />
                {muteChannelText}
            </MenuItem>
        );
    }

    let copyLinkMenuItem: JSX.Element | null = null;
    if (props.channel.type === Constants.OPEN_CHANNEL || props.channel.type === Constants.PRIVATE_CHANNEL) {
        function handleCopyLink(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            copyToClipboard(props.channelLink);
        }

        copyLinkMenuItem = (
            <MenuItem
                id={`copyLink-${props.channel.id}`}
                onClick={handleCopyLink}
            >
                <LinkVariantIcon
                    size={16}
                    color='currentColor'
                />
                {formatMessage({id: 'sidebar_left.sidebar_channel_menu.copyLink', defaultMessage: 'Copy Link'})}
            </MenuItem>
        );
    }

    let addMembersMenuItem: JSX.Element | null = null;
    if ((props.channel.type === Constants.PRIVATE_CHANNEL && props.managePrivateChannelMembers) || (props.channel.type === Constants.OPEN_CHANNEL && props.managePublicChannelMembers)) {
        function handleAddMembers(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            props.openModal({
                modalId: ModalIdentifiers.CHANNEL_INVITE,
                dialogType: ChannelInviteModal,
                dialogProps: {channel: props.channel},
            });
            trackEvent('ui', 'ui_sidebar_channel_menu_addMembers');
        }

        addMembersMenuItem = (
            <MenuItem
                id={`addMembers-${props.channel.id}`}
                onClick={handleAddMembers}
            >
                <AccountOutlineIcon
                    size={16}
                    color='currentColor'
                />
                {formatMessage({id: 'sidebar_left.sidebar_channel_menu.addMembers', defaultMessage: 'Add Members'})}
            </MenuItem>
        );
    }

    let leaveChannelMenuItem: JSX.Element | null = null;
    if (props.channel.name !== Constants.DEFAULT_CHANNEL) {
        let leaveChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveChannel', defaultMessage: 'Leave Channel'});
        if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
            leaveChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveConversation', defaultMessage: 'Close Conversation'});
        }

        function handleLeaveChannel(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();
            event.stopPropagation();

            if (isLeaving.current || !props.closeHandler) {
                return;
            }

            isLeaving.current = true;

            props.closeHandler(() => {
                isLeaving.current = false;
            });

            trackEvent('ui', 'ui_sidebar_channel_menu_leave');
        }

        leaveChannelMenuItem = (
            <MenuItem
                id={`leave-${props.channel.id}`}
                onClick={handleLeaveChannel}
            >
                <CloseIcon
                    size={16}
                    color='currentColor'
                />
                {leaveChannelText}
            </MenuItem>
        );
    }

    return (
        <Menu
            tooltipId={`SidebarChannelTooltip-${props.channel.id}`}
            tooltipClassName='hidden-xs'
            tooltipText={formatMessage({id: 'sidebar_left.sidebar_channel_menu.editChannel', defaultMessage: 'Channel options'})}
            anchorClassName='SidebarMenu_menuButton'
            anchorAriaLabel={formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
            anchorNode={<DotsVerticalIcon/>}
            menuId={`SidebarChannelMenu-${props.channel.id}`}
            menuAriaLabel={formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
        >
            {markAsReadUnreadMenuItem}
            {favoriteUnfavoriteMenuItem}
            {muteUnmuteChannelMenuItem}
            <MenuDivider/>
            <ChannelMoveToSubmenu
                channel={props.channel}
                inSidebar={true}
            />
            <MenuDivider/>
            {copyLinkMenuItem}
            {addMembersMenuItem}
            {leaveChannelMenuItem && <MenuDivider/>}
            {leaveChannelMenuItem}
        </Menu>
    );
};

export default memo(SidebarChannelMenu);
