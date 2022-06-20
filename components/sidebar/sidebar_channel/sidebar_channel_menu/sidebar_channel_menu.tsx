// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {useIntl} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import classNames from 'classnames';

import {ChannelCategory} from '@mattermost/types/channel_categories';

import {Channel} from '@mattermost/types/channels';

import {trackEvent} from 'actions/telemetry_actions';

import ChannelInviteModal from 'components/channel_invite_modal';

import {
    favoriteChannel,
    unfavoriteChannel,
    markChannelAsRead,
    leaveChannel,
} from 'mattermost-redux/actions/channels';
import {isFavoriteChannel} from 'mattermost-redux/selectors/entities/channels';
import {
    getMyChannelMemberships,
    getCurrentUserId,
} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {copyToClipboard} from 'utils/utils';

import Menu from 'components/menu/Menu';

import {unmuteChannel, muteChannel} from 'actions/channel_actions';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'types/store';
import {
    getCategoriesForCurrentTeam,
    getDisplayedChannels,
} from 'selectors/views/channel_sidebar';
import {getCategoryInTeamWithChannel} from 'mattermost-redux/selectors/entities/channel_categories';
import {addChannelsInSidebar} from 'actions/views/channel_sidebar';
import {openModal} from 'actions/views/modals';
import EditCategoryModal from 'components/edit_category_modal/edit_category_modal';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import LeavePrivateChannelModal from 'components/leave_private_channel_modal/leave_private_channel_modal';

type Props = {
    channel: Channel;
    channelLink: string;
    location?: string;
};

const SidebarChannelMenu = (props: Props): JSX.Element => {
    const {channel, channelLink, location} = props;

    const buttonReference = useRef<HTMLButtonElement>(null);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const intl = useIntl();
    const dispatch = useDispatch<DispatchFunc>();

    const member = useSelector(
        (state: GlobalState) => getMyChannelMemberships(state)[channel.id],
    );

    const isUnread = useSelector((state: GlobalState) =>
        getDisplayedChannels(state),
    );

    const currentUserId = useSelector((state: GlobalState) =>
        getCurrentUserId(state),
    );
    const isFavorite = useSelector((state: GlobalState) =>
        isFavoriteChannel(state, channel.id),
    );
    const isMuted = useSelector(() => isChannelMuted(member));
    const displayedChannels = useSelector((state: GlobalState) =>
        getDisplayedChannels(state),
    );
    const multiSelectedChannelIds = useSelector(
        (state: GlobalState) =>
            state.views.channelSidebar.multiSelectedChannelIds,
    );
    const currentTeam = useSelector((state: GlobalState) =>
        getCurrentTeam(state),
    );

    //****************** Menu Item Actions ******************//

    const handleLeavePublicChannel = () => {
        dispatch(leaveChannel(channel.id));
        trackEvent('ui', 'ui_public_channel_x_button_clicked');
    };

    const handleLeavePrivateChannel = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.LEAVE_PRIVATE_CHANNEL_MODAL,
                dialogType: LeavePrivateChannelModal,
                dialogProps: {channel},
            }),
        );
        trackEvent('ui', 'ui_private_channel_x_button_clicked');
    };

    const getCloseHandler = () => {
        if (
            channel.type === Constants.OPEN_CHANNEL &&
            channel.name !== Constants.DEFAULT_CHANNEL
        ) {
            return handleLeavePublicChannel;
        } else if (channel.type === Constants.PRIVATE_CHANNEL) {
            return handleLeavePrivateChannel;
        }

        return null;
    };

    const markAsRead = () => {
        dispatch(markChannelAsRead(channel.id));
        trackEvent('ui', 'ui_sidebar_channel_menu_markAsRead');
    };

    const toggleFavourite = () => {
        if (isFavorite) {
            dispatch(favoriteChannel(channel.id));
            trackEvent('ui', 'ui_sidebar_channel_menu_favorite');
        } else {
            dispatch(unfavoriteChannel(channel.id));
            trackEvent('ui', 'ui_sidebar_channel_menu_unfavorite');
        }
    };

    const toggleMute = () => {
        return isMuted ? dispatch(unmuteChannel(currentUserId, channel.id)) : dispatch(muteChannel(currentUserId, channel.id));
    };

    const copyLink = () => {
        copyToClipboard(channelLink);
    };

    const addMembers = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.CHANNEL_INVITE,
                dialogType: ChannelInviteModal,
                dialogProps: {channel},
            }),
        );
        trackEvent('ui', 'ui_sidebar_channel_menu_addMembers');
    };

    //****************** Category Submenu Actions ******************//

    const categories = useSelector((state: GlobalState) =>
        getCategoriesForCurrentTeam(state),
    );
    const currentCategory = useSelector((state: GlobalState) =>
        getCategoryInTeamWithChannel(state, currentTeam.id, channel.id),
    );

    const moveToCategory = (categoryId: string) => {
        if (currentCategory?.id !== categoryId) {
            dispatch(addChannelsInSidebar(categoryId, channel.id));
            trackEvent('ui', 'ui_sidebar_channel_menu_moveToExistingCategory');
        }
    };

    const moveToNewCategory = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.EDIT_CATEGORY,
                dialogType: EditCategoryModal,
                dialogProps: {
                    channelIdsToAdd:
                        multiSelectedChannelIds.indexOf(channel.id) === -1 ?
                            [channel.id] :
                            multiSelectedChannelIds,
                },
            }),
        );
        trackEvent('ui', 'ui_sidebar_channel_menu_createCategory');
    };

    const toggleMenu = () => {
        setMenuVisible(!isMenuVisible);
    };

    const isDM =
        channel.type === Constants.DM_CHANNEL ||
        channel.type === Constants.GM_CHANNEL;

    const mutedLabel =
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
            {
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
                onClick: getCloseHandler,
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
