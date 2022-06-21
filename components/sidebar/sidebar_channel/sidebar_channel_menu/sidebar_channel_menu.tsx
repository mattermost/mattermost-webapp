// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import {ChannelCategory} from '@mattermost/types/channel_categories';
import {Channel} from '@mattermost/types/channels';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';

import {trackEvent} from 'actions/telemetry_actions';
import EditCategoryModal from 'components/edit_category_modal/edit_category_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import Menu from 'components/menu/Menu';
import {ModalData} from 'types/actions';
import Constants, {ModalIdentifiers} from 'utils/constants';
import {copyToClipboard} from 'utils/utils';

type Props = {
    channel: Channel;
    channelLink: string;
    location: string;
    currentUserId: string;
    currentTeamId: string;
    isUnread: boolean;
    isFavorite: boolean;
    isMuted: boolean;
    managePublicChannelMembers: boolean;
    managePrivateChannelMembers: boolean;
    displayedChannels: Channel[];
    multiSelectedChannelIds: string[];
    categories?: ChannelCategory[];
    currentCategory?: ChannelCategory;
    closeHandler?: (callback: () => void) => void;
    actions: {
        markChannelAsRead: (channelId: string) => void;
        favoriteChannel: (channelId: string) => void;
        unfavoriteChannel: (channelId: string) => void;
        muteChannel: (userId: string, channelId: string) => void;
        unmuteChannel: (userId: string, channelId: string) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
        addChannelsInSidebar: (categoryId: string, channelId: string) => void;
    };
};

const SidebarChannelMenu = (props: Props): JSX.Element => {
    const {channel, channelLink, currentUserId, location, isUnread, isFavorite, isMuted, actions, closeHandler, displayedChannels, multiSelectedChannelIds, currentCategory, categories} = props;
    const buttonReference = useRef<HTMLButtonElement>(null);

    const [isLeaving, setIsleaving] = useState(false);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const intl = useIntl();

    const handleLeaveChannel = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLeaving || !closeHandler) {
            return;
        }

        setIsleaving(true);
        trackEvent('ui', 'ui_sidebar_channel_menu_leave');

        closeHandler(() => {
            setIsleaving(false);
        });
    };

    const markAsRead = () => {
        actions.markChannelAsRead(channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_markAsRead');
    };

    const toggleFavourite = () => {
        if (isFavorite) {
            actions.unfavoriteChannel(channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_unfavorite');
        } else {
            actions.favoriteChannel(channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_favorite');
        }
    };

    const toggleMute = () => {
        return isMuted ? actions.unmuteChannel(currentUserId, channel.id) : actions.muteChannel(currentUserId, channel.id);
    };

    const copyLink = () => {
        copyToClipboard(channelLink);
    };

    const addMembers = () => {
        actions.openModal({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel},
        });
        trackEvent('ui', 'ui_sidebar_channel_menu_addMembers');
    };

    const moveToCategory = (categoryId: string) => {
        if (currentCategory?.id !== categoryId) {
            actions.addChannelsInSidebar(categoryId, channel.id);
            trackEvent('ui', 'ui_sidebar_channel_menu_moveToExistingCategory');
        }
    };

    const moveToNewCategory = () => {
        actions.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
            dialogProps: {
                channelIdsToAdd: multiSelectedChannelIds.indexOf(channel.id) === -1 ? [channel.id] : multiSelectedChannelIds,
            },
        });
        trackEvent('ui', 'ui_sidebar_channel_menu_createCategory');
    };

    const toggleMenu = () => {
        setMenuVisible(!isMenuVisible);
    };

    const isDM =
        channel.type === Constants.DM_CHANNEL ||
        channel.type === Constants.GM_CHANNEL;

    const canAddMembers = (channel.type === Constants.PRIVATE_CHANNEL && props.managePrivateChannelMembers) || (channel.type === Constants.OPEN_CHANNEL && props.managePublicChannelMembers);

    const mutedLabel =
        /* eslint-disable no-nested-ternary */
        isMuted ?
            isDM ?
                intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.unmuteConversation',
                    defaultMessage: 'Unmute Conversation',
                }) :
                intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.unmuteChannel',
                    defaultMessage: 'Unmute Channel',
                }) : isDM ?
                intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.muteConversation',
                    defaultMessage: 'Mute Conversation',
                }) :
                intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.muteChannel',
                    defaultMessage: 'Mute Channel',
                });

    let filteredCategories = categories?.filter(
        (category) => category.type !== CategoryTypes.DIRECT_MESSAGES,
    );

    if (location === 'sidebar') {
        const selectedChannels =
            multiSelectedChannelIds.indexOf(channel.id) === -1 ?
                [channel] :
                displayedChannels.filter(
                    (c) => multiSelectedChannelIds.indexOf(c.id) !== -1,
                );
        const allChannelsAreDMs = selectedChannels.every(
            (selectedChannel) =>
                selectedChannel.type === Constants.DM_CHANNEL ||
                selectedChannel.type === Constants.GM_CHANNEL,
        );
        const allChannelsAreNotDMs = selectedChannels.every(
            (selectedChannel) =>
                selectedChannel.type !== Constants.DM_CHANNEL &&
                selectedChannel.type !== Constants.GM_CHANNEL,
        );

        filteredCategories = categories?.filter((category) => {
            if (allChannelsAreDMs) {
                return category.type !== CategoryTypes.CHANNELS;
            } else if (allChannelsAreNotDMs) {
                return category.type !== CategoryTypes.DIRECT_MESSAGES;
            }
            return true;
        });
    }

    const categoryMenuItems = filteredCategories?.map(
        (category: ChannelCategory) => {
            return (
                {
                    label: category.display_name,
                    leadingElement:
                        category.type === CategoryTypes.FAVORITES ? (
                            <i className='icon-star-outline'/>
                        ) : (
                            <i className='icon-folder-outline'/>
                        ),
                    onClick: () => moveToCategory(category.id),
                }
            );
        },
    );

    const submenuItems = [
        ...categoryMenuItems,
        {
            label: intl.formatMessage({
                id: 'sidebar_left.sidebar_channel_menu.moveToNewCategory',
                defaultMessage: 'New Category',
            }),
            onClick: moveToNewCategory,
            leadingElement: <i className='icon-plus'/>,
        },
    ];

    const menuData = {
        title: 'Channels',
        items: [
            isUnread && {
                label: intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.markAsRead',
                    defaultMessage: 'Mark as Read',
                }),
                onClick: markAsRead,
                leadingElement: <i className='icon-mark-as-unread'/>,
            },
            {
                label: isFavorite ? intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.unfavoriteChannel',
                    defaultMessage: 'Unfavorite'}) : intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.favoriteChannel',
                    defaultMessage: 'Favorite',
                }),
                onClick: toggleFavourite,
                leadingElement: <i className={isFavorite ? 'icon-star' : 'icon-star-outline'}/>,
            },
            {
                label: mutedLabel,
                onClick: toggleMute,
                leadingElement: <i className={isMuted ? 'icon-bell-off-outline' : 'icon-bell-outline'}/>,
                divider: true,
            },
            !isDM && {
                label: intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.copyLink',
                    defaultMessage: 'Copy Link',
                }),
                onClick: copyLink,
                leadingElement: <i className='icon-link-variant'/>,
            },
            {
                label: intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.moveTo',
                    defaultMessage: 'Move to...',
                }),
                onClick: copyLink,
                leadingElement: <i className='icon-folder-move-outline'/>,
                trailingElementLabel: 'selected',
                trailingElement: <i className='icon-chevron-right'/>,
                items: submenuItems,
            },
            canAddMembers && {
                label: intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.addMembers',
                    defaultMessage: 'Add Members',
                }),
                onClick: addMembers,
                leadingElement: <i className='icon-account-outline'/>,
            },
            channel.name !== Constants.DEFAULT_CHANNEL && {
                label: isDM ?
                    intl.formatMessage({
                        id: 'sidebar_left.sidebar_channel_menu.leaveConversation',
                        defaultMessage: 'Close Conversation',
                    }) :
                    intl.formatMessage({
                        id: 'sidebar_left.sidebar_channel_menu.leaveChannel',
                        defaultMessage: 'Leave Channel',
                    }),
                onClick: handleLeaveChannel,
                leadingElement: <i className='icon-close'/>,
            },
        ],
    };

    return (
        <>
            <button
                ref={buttonReference}
                className={classNames(['SidebarMenu_menuButton'])}
                onClick={toggleMenu}
            />
            <Menu
                title={intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel',
                    defaultMessage: 'Channel Menu',
                })}
                trigger={buttonReference}
                data={menuData}
                open={isMenuVisible}
                overlayCloseHandler={() => setMenuVisible(false)}
            />
        </>
    );
};

export default SidebarChannelMenu;
