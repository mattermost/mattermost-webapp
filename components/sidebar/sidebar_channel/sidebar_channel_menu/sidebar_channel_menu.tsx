// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState, MouseEvent, memo} from 'react';
import {useIntl} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import CategoryMenuItems from 'components/category_menu_items';
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

    const intl = useIntl();

    function handleMarkAsRead() {
        props.markChannelAsRead(props.channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_markAsRead');
    }

    function handleMarkAsUnread() {
        props.markMostRecentPostInChannelAsUnread(props.channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_markAsUnread');
    }

    function handleFavoriteChannel() {
        props.favoriteChannel(props.channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_favorite');
    }

    function handleUnfavoriteChannel() {
        props.unfavoriteChannel(props.channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_unfavorite');
    }

    function handleUnmuteChannel() {
        props.unmuteChannel(props.currentUserId, props.channel.id);
    }

    function handleMuteChannel() {
        props.muteChannel(props.currentUserId, props.channel.id);
    }

    function handleCopyLink() {
        copyToClipboard(props.channelLink);
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

    function handleAddMembers() {
        props.openModal({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel: props.channel},
        });
        trackEvent('ui', 'ui_sidebar_channel_menu_addMembers');
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

    let markAsReadMenuItem: JSX.Element | null = null;
    if (props.isUnread) {
        markAsReadMenuItem = (
            <Menu.ItemAction
                id={`markAsRead-${props.channel.id}`}
                onClick={handleMarkAsRead}
                icon={<i className='icon-mark-as-unread'/>}
                text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.markAsRead', defaultMessage: 'Mark as Read'})}
            />
        );
    }

    let markAsUnreadMenuItem: JSX.Element | null = null;
    if (!props.isUnread) {
        markAsUnreadMenuItem = (
            <Menu.ItemAction
                id={`markAsUnread-${props.channel.id}`}
                onClick={handleMarkAsUnread}
                icon={<i className='icon-mark-as-unread'/>}
                text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.markAsUnread', defaultMessage: 'Mark as Unread'})}
            />
        );
    }

    let favoriteMenuItem: JSX.Element | null = null;
    if (props.isFavorite) {
        favoriteMenuItem = (
            <Menu.ItemAction
                id={`unfavorite-${props.channel.id}`}
                onClick={handleUnfavoriteChannel}
                icon={<i className='icon-star'/>}
                text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unfavoriteChannel', defaultMessage: 'Unfavorite'})}
            />
        );
    } else {
        favoriteMenuItem = (
            <Menu.ItemAction
                id={`favorite-${props.channel.id}`}
                onClick={handleFavoriteChannel}
                icon={<i className='icon-star-outline'/>}
                text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.favoriteChannel', defaultMessage: 'Favorite'})}
            />
        );
    }

    let muteChannelMenuItem: JSX.Element | null = null;
    if (props.isMuted) {
        let muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteChannel', defaultMessage: 'Unmute Channel'});
        if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
            muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteConversation', defaultMessage: 'Unmute Conversation'});
        }

        muteChannelMenuItem = (
            <Menu.ItemAction
                id={`unmute-${props.channel.id}`}
                onClick={handleUnmuteChannel}
                icon={<i className='icon-bell-off-outline'/>}
                text={muteChannelText}
            />
        );
    } else {
        let muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteChannel', defaultMessage: 'Mute Channel'});
        if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
            muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteConversation', defaultMessage: 'Mute Conversation'});
        }
        muteChannelMenuItem = (
            <Menu.ItemAction
                id={`mute-${props.channel.id}`}
                onClick={handleMuteChannel}
                icon={<i className='icon-bell-outline'/>}
                text={muteChannelText}
            />
        );
    }

    let copyLinkMenuItem: JSX.Element | null = null;
    if (props.channel.type === Constants.OPEN_CHANNEL || props.channel.type === Constants.PRIVATE_CHANNEL) {
        copyLinkMenuItem = (
            <Menu.ItemAction
                id={`copyLink-${props.channel.id}`}
                onClick={handleCopyLink}
                icon={<i className='icon-link-variant'/>}
                text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.copyLink', defaultMessage: 'Copy Link'})}
            />
        );
    }

    let addMembersMenuItem: JSX.Element | null = null;
    if ((props.channel.type === Constants.PRIVATE_CHANNEL && props.managePrivateChannelMembers) || (props.channel.type === Constants.OPEN_CHANNEL && props.managePublicChannelMembers)) {
        addMembersMenuItem = (
            <Menu.ItemAction
                id={`addMembers-${props.channel.id}`}
                onClick={handleAddMembers}
                icon={<i className='icon-account-outline'/>}
                text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.addMembers', defaultMessage: 'Add Members'})}
            />
        );
    }

    let leaveChannelMenuItem: JSX.Element | null = null;
    if (props.channel.name !== Constants.DEFAULT_CHANNEL) {
        let leaveChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveChannel', defaultMessage: 'Leave Channel'});
        if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
            leaveChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveConversation', defaultMessage: 'Close Conversation'});
        }

        leaveChannelMenuItem = (
            <Menu.Group>
                <Menu.ItemAction
                    id={`leave-${props.channel.id}`}
                    onClick={handleLeaveChannel}
                    icon={<i className='icon-close'/>}
                    text={leaveChannelText}
                    isDangerous={!(props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL)}
                />
            </Menu.Group>
        );
    }

    return (
        <SidebarMenu
            id={`SidebarChannelMenu-${props.channel.id}`}
            ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
            buttonAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
            isMenuOpen={props.isMenuOpen}
            onOpenDirectionChange={handleOpenDirectionChange}
            onToggleMenu={onToggleMenu}
            tooltipText={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.editChannel', defaultMessage: 'Channel options'})}
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
                    <CategoryMenuItems
                        channel={props.channel}
                        openUp={openUp}
                        location={'sidebar'}
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
