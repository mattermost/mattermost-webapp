// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState, MouseEvent, memo} from 'react';
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
} from '@mattermost/compass-icons/components';

import {trackEvent} from 'actions/telemetry_actions';

import ChannelMoveToSubMenu from 'components/channel_move_to_sub_menu';
import ChannelInviteModal from 'components/channel_invite_modal';
import SidebarMenu from 'components/sidebar/sidebar_menu';
import Menu from 'components/widgets/menu/menu';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {copyToClipboard} from 'utils/utils';

import type {PropsFromRedux, OwnProps} from './index';

type Props = PropsFromRedux & OwnProps;

const SidebarChannelMenu = (props: Props) => {
    const isLeaving = useRef(false);
    const [openUp, setOpenUp] = useState(false);

    const {formatMessage} = useIntl();

    let markAsReadMenuItem: JSX.Element | null = null;
    if (props.isUnread) {
        function handleMarkAsRead() {
            props.markChannelAsRead(props.channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_markAsRead');
        }

        markAsReadMenuItem = (
            <Menu.ItemAction
                id={`markAsRead-${props.channel.id}`}
                onClick={handleMarkAsRead}
                icon={<MarkAsUnreadIcon size={16}/>}
                text={formatMessage({id: 'sidebar_left.sidebar_channel_menu.markAsRead', defaultMessage: 'Mark as Read'})}
            />
        );
    }

    let markAsUnreadMenuItem: JSX.Element | null = null;
    if (!props.isUnread) {
        function handleMarkAsUnread() {
            props.markMostRecentPostInChannelAsUnread(props.channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_markAsUnread');
        }

        markAsUnreadMenuItem = (
            <Menu.ItemAction
                id={`markAsUnread-${props.channel.id}`}
                onClick={handleMarkAsUnread}
                icon={<MarkAsUnreadIcon size={16}/>}
                text={formatMessage({id: 'sidebar_left.sidebar_channel_menu.markAsUnread', defaultMessage: 'Mark as Unread'})}
            />
        );
    }

    let favoriteMenuItem: JSX.Element | null = null;
    if (props.isFavorite) {
        function handleUnfavoriteChannel() {
            props.unfavoriteChannel(props.channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_unfavorite');
        }

        favoriteMenuItem = (
            <Menu.ItemAction
                id={`unfavorite-${props.channel.id}`}
                onClick={handleUnfavoriteChannel}
                icon={<StarIcon size={16}/>}
                text={formatMessage({id: 'sidebar_left.sidebar_channel_menu.unfavoriteChannel', defaultMessage: 'Unfavorite'})}
            />
        );
    } else {
        function handleFavoriteChannel() {
            props.favoriteChannel(props.channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_favorite');
        }

        favoriteMenuItem = (
            <Menu.ItemAction
                id={`favorite-${props.channel.id}`}
                onClick={handleFavoriteChannel}
                icon={<StarOutlineIcon size={16}/>}
                text={formatMessage({id: 'sidebar_left.sidebar_channel_menu.favoriteChannel', defaultMessage: 'Favorite'})}
            />
        );
    }

    let muteChannelMenuItem: JSX.Element | null = null;
    if (props.isMuted) {
        let muteChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteChannel', defaultMessage: 'Unmute Channel'});
        if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
            muteChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteConversation', defaultMessage: 'Unmute Conversation'});
        }

        function handleUnmuteChannel() {
            props.unmuteChannel(props.currentUserId, props.channel.id);
        }

        muteChannelMenuItem = (
            <Menu.ItemAction
                id={`unmute-${props.channel.id}`}
                onClick={handleUnmuteChannel}
                icon={<BellOffOutlineIcon size={16}/>}
                text={muteChannelText}
            />
        );
    } else {
        let muteChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteChannel', defaultMessage: 'Mute Channel'});
        if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
            muteChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteConversation', defaultMessage: 'Mute Conversation'});
        }

        function handleMuteChannel() {
            props.muteChannel(props.currentUserId, props.channel.id);
        }

        muteChannelMenuItem = (
            <Menu.ItemAction
                id={`mute-${props.channel.id}`}
                onClick={handleMuteChannel}
                icon={<BellOutlineIcon size={16}/>}
                text={muteChannelText}
            />
        );
    }

    let copyLinkMenuItem: JSX.Element | null = null;
    if (props.channel.type === Constants.OPEN_CHANNEL || props.channel.type === Constants.PRIVATE_CHANNEL) {
        function handleCopyLink() {
            copyToClipboard(props.channelLink);
        }

        copyLinkMenuItem = (
            <Menu.ItemAction
                id={`copyLink-${props.channel.id}`}
                onClick={handleCopyLink}
                icon={<LinkVariantIcon size={16}/>}
                text={formatMessage({id: 'sidebar_left.sidebar_channel_menu.copyLink', defaultMessage: 'Copy Link'})}
            />
        );
    }

    let addMembersMenuItem: JSX.Element | null = null;
    if ((props.channel.type === Constants.PRIVATE_CHANNEL && props.managePrivateChannelMembers) || (props.channel.type === Constants.OPEN_CHANNEL && props.managePublicChannelMembers)) {
        function handleAddMembers() {
            props.openModal({
                modalId: ModalIdentifiers.CHANNEL_INVITE,
                dialogType: ChannelInviteModal,
                dialogProps: {channel: props.channel},
            });
            trackEvent('ui', 'ui_sidebar_channel_menu_addMembers');
        }

        addMembersMenuItem = (
            <Menu.ItemAction
                id={`addMembers-${props.channel.id}`}
                onClick={handleAddMembers}
                icon={<AccountOutlineIcon size={16}/>}
                text={formatMessage({id: 'sidebar_left.sidebar_channel_menu.addMembers', defaultMessage: 'Add Members'})}
            />
        );
    }

    let leaveChannelMenuItem: JSX.Element | null = null;
    if (props.channel.name !== Constants.DEFAULT_CHANNEL) {
        let leaveChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveChannel', defaultMessage: 'Leave Channel'});
        if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
            leaveChannelText = formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveConversation', defaultMessage: 'Close Conversation'});
        }

        function handleLeaveChannel(e: MouseEvent<HTMLSpanElement, MouseEvent>) {
            e.preventDefault();
            e.stopPropagation();

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
            <Menu.Group>
                <Menu.ItemAction
                    id={`leave-${props.channel.id}`}
                    onClick={handleLeaveChannel}
                    icon={<CloseIcon size={16}/>}
                    text={leaveChannelText}
                    isDangerous={!(props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL)}
                />
            </Menu.Group>
        );
    }

    function handleOpenDirectionChange(openUp: boolean) {
        setOpenUp(openUp);
    }

    function onToggleMenu(open: boolean) {
        props.onToggleMenu(open);

        if (open) {
            trackEvent('ui', 'ui_sidebar_channel_menu_opened');
        }
    }

    return (
        <SidebarMenu
            id={`SidebarChannelMenu-${props.channel.id}`}
            ariaLabel={formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
            buttonAriaLabel={formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
            isMenuOpen={props.isMenuOpen}
            onOpenDirectionChange={handleOpenDirectionChange}
            onToggleMenu={onToggleMenu}
            tooltipText={formatMessage({id: 'sidebar_left.sidebar_channel_menu.editChannel', defaultMessage: 'Channel options'})}
            tabIndex={props.isCollapsed ? -1 : 0}
        >
            {props.isMenuOpen && (
                <>
                    <Menu.Group>
                        {markAsReadMenuItem}
                        {markAsUnreadMenuItem}
                        {favoriteMenuItem}
                        {muteChannelMenuItem}
                    </Menu.Group>
                    <ChannelMoveToSubMenu
                        channel={props.channel}
                        openUp={openUp}
                    />
                    <Menu.Group>
                        {copyLinkMenuItem}
                        {addMembersMenuItem}
                    </Menu.Group>
                    {leaveChannelMenuItem}
                </>
            )}
        </SidebarMenu>
    );
};

export default memo(SidebarChannelMenu);
