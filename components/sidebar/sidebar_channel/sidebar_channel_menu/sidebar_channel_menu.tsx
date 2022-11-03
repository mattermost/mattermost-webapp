// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEvent, ReactNode} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {
    DotsVerticalIcon,
    MarkAsUnreadIcon,
    StarIcon,
    StarOutlineIcon,
    BellOutlineIcon,
    BellOffOutlineIcon,
    LinkVariantIcon,
    AccountOutlineIcon,
    CloseIcon,
} from '@mattermost/compass-icons/components';

import {Channel} from '@mattermost/types/channels';

import {trackEvent} from 'actions/telemetry_actions';

// import CategoryMenuItems from 'components/category_menu_items';
import ChannelInviteModal from 'components/channel_invite_modal';
import {Menu, MenuItem, MenuList, MenuDivider} from 'components/menu';

import {ModalData} from 'types/actions';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {copyToClipboard} from 'utils/utils';

type Props = {
    channel: Channel;
    channelLink: string;
    currentUserId: string;
    currentTeamId: string;
    isUnread: boolean;
    isFavorite: boolean;
    isMuted: boolean;
    managePublicChannelMembers: boolean;
    managePrivateChannelMembers: boolean;
    closeHandler?: (callback: () => void) => void;
    isCollapsed: boolean;
    isMenuOpen: boolean;
    onToggleMenu: (isMenuOpen: boolean) => void;
    actions: {
        markChannelAsRead: (channelId: string) => void;
        favoriteChannel: (channelId: string) => void;
        unfavoriteChannel: (channelId: string) => void;
        muteChannel: (userId: string, channelId: string) => void;
        unmuteChannel: (userId: string, channelId: string) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
};

function SidebarChannelMenu(props: Props) {
    // isLeaving: boolean;

    // constructor(props: Props) {
    //     super(props);

    //     this.isLeaving = false;
    // }

    const intl = useIntl();

    function handleMarkAsRead(event: MouseEvent<HTMLLIElement>) {
        event.preventDefault();
        props.actions.markChannelAsRead(props.channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_markAsRead');
    }

    function handleUnfavoriteChannel(event: MouseEvent<HTMLLIElement>) {
        event.preventDefault();
        props.actions.unfavoriteChannel(props.channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_unfavorite');
    }

    function handleFavoriteChannel(event: MouseEvent<HTMLLIElement>) {
        event.preventDefault();
        props.actions.favoriteChannel(props.channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_favorite');
    }

    function handleUnmuteChannel(event: MouseEvent<HTMLLIElement>) {
        event.preventDefault();
        props.actions.unmuteChannel(props.currentUserId, props.channel.id);
    }

    function handleMuteChannel(event: MouseEvent<HTMLLIElement>) {
        event.preventDefault();
        props.actions.muteChannel(props.currentUserId, props.channel.id);
    }

    function handleCopyLink(event: MouseEvent<HTMLLIElement>) {
        event.preventDefault();
        copyToClipboard(props.channelLink);
    }

    function handleLeaveChannel(event: MouseEvent<HTMLLIElement>) {
        event.preventDefault();

        // if (this.isLeaving || !props.closeHandler) {
        //     return;
        // }

        if (!props.closeHandler) {
            return;
        }

        // this.isLeaving = true;
        trackEvent('ui', 'ui_sidebar_channel_menu_leave');

        props.closeHandler(() => {
            // this.isLeaving = false;
        });
    }

    function handleAddMembers(event: MouseEvent<HTMLLIElement>) {
        event.preventDefault();

        const {channel, actions} = props;

        actions.openModal({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel},
        });
        trackEvent('ui', 'ui_sidebar_channel_menu_addMembers');
    }

    let menuMarkAsRead: ReactNode | null = null;
    if (props.isUnread) {
        menuMarkAsRead = (
            <MenuItem
                id={`markAsRead-${props.channel.id}`}
                onClick={handleMarkAsRead}
            >
                <MarkAsUnreadIcon
                    size={18}
                />
                <FormattedMessage
                    id='sidebar_left.sidebar_channel_menu.markAsRead'
                    defaultMessage='Mark as Read'
                />
            </MenuItem>
        );
    }

    function channelMenuItems() {
        let favorite;
        if (props.isFavorite) {
            favorite = (
                <MenuItem
                    id={`unfavorite-${props.channel.id}`}
                    onClick={handleUnfavoriteChannel}
                >
                    <StarIcon
                        size={18}
                    />
                    <FormattedMessage
                        id='sidebar_left.sidebar_channel_menu.unfavoriteChannel'
                        defaultMessage='Unfavorite'
                    />
                </MenuItem>
            );
        } else {
            favorite = (
                <MenuItem
                    id={`favorite-${props.channel.id}`}
                    onClick={handleFavoriteChannel}
                >
                    <StarOutlineIcon
                        size={18}
                    />
                    <FormattedMessage
                        id='sidebar_left.sidebar_channel_menu.favoriteChannel'
                        defaultMessage='Favorite'
                    />
                </MenuItem>
            );
        }

        let muteChannel;
        if (props.isMuted) {
            let muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteChannel', defaultMessage: 'Unmute Channel'});
            if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
                muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteConversation', defaultMessage: 'Unmute Conversation'});
            }
            muteChannel = (
                <MenuItem
                    id={`unmute-${props.channel.id}`}
                    onClick={handleUnmuteChannel}
                >
                    <BellOffOutlineIcon
                        size={18}
                    />
                    {muteChannelText}
                </MenuItem>
            );
        } else {
            let muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteChannel', defaultMessage: 'Mute Channel'});
            if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
                muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteConversation', defaultMessage: 'Mute Conversation'});
            }
            muteChannel = (
                <MenuItem
                    id={`mute-${props.channel.id}`}
                    onClick={handleMuteChannel}
                >
                    <BellOutlineIcon
                        size={18}
                    />
                    {muteChannelText}
                </MenuItem>
            );
        }

        let copyLink;
        if (props.channel.type === Constants.OPEN_CHANNEL || props.channel.type === Constants.PRIVATE_CHANNEL) {
            copyLink = (
                <MenuItem
                    id={`copyLink-${props.channel.id}`}
                    onClick={handleCopyLink}
                >
                    <LinkVariantIcon
                        size={18}
                    />
                    <FormattedMessage
                        id='sidebar_left.sidebar_channel_menu.copyLink'
                        defaultMessage='Copy Link'
                    />
                </MenuItem>
            );
        }

        let addMembers;
        if ((props.channel.type === Constants.PRIVATE_CHANNEL && props.managePrivateChannelMembers) || (props.channel.type === Constants.OPEN_CHANNEL && props.managePublicChannelMembers)) {
            addMembers = (
                <MenuItem
                    id={`addMembers-${props.channel.id}`}
                    onClick={handleAddMembers}
                >
                    <AccountOutlineIcon
                        size={18}
                    />
                    <FormattedMessage
                        id='sidebar_left.sidebar_channel_menu.addMembers'
                        defaultMessage='Add Members'
                    />
                </MenuItem>
            );
        }

        let leaveChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveChannel', defaultMessage: 'Leave Channel'});
        if (props.channel.type === Constants.DM_CHANNEL || props.channel.type === Constants.GM_CHANNEL) {
            leaveChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveConversation', defaultMessage: 'Close Conversation'});
        }

        let leaveChannel;
        if (props.channel.name !== Constants.DEFAULT_CHANNEL) {
            leaveChannel = (
                <>
                    <MenuDivider/>
                    <MenuItem
                        id={`leave-${props.channel.id}`}
                        onClick={handleLeaveChannel}
                    >
                        <CloseIcon
                            size={18}
                        />
                        {leaveChannelText}
                    </MenuItem>
                </>
            );
        }

        return (
            <MenuList>
                {menuMarkAsRead}
                {favorite}
                {muteChannel}
                <MenuDivider/>
                {/* <CategoryMenuItems
                    channel={channel}
                    location={'sidebar'}
                /> */}
                <MenuDivider/>
                {copyLink}
                {addMembers}
                {leaveChannel}
            </MenuList>
        );
    }

    return (
        <Menu
            tooltipId={`SidebarChannelTooltip-${props.channel.id}`}
            tooltipClassName='hidden-xs'
            tooltipText={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.editChannel', defaultMessage: 'Channel options'})}
            anchorClassName='SidebarMenu_menuButton'
            anchorAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
            anchorNode={<DotsVerticalIcon/>}
            menuId={`SidebarChannelMenu-${props.channel.id}`}
            menuAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
        >
            {channelMenuItems()}
        </Menu>
    );
}

export default SidebarChannelMenu;
