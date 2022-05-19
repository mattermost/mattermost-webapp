// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {IntlShape, useIntl} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';

import {trackEvent} from 'actions/telemetry_actions';

import ChannelInviteModal from 'components/channel_invite_modal';
import SidebarMenu from 'components/sidebar/sidebar_menu';
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators, ActionCreatorsMapObject} from 'redux';

import {
    favoriteChannel,
    unfavoriteChannel,
    markChannelAsRead,
    leaveChannel,
} from 'mattermost-redux/actions/channels';
import Permissions from 'mattermost-redux/constants/permissions';
import {isFavoriteChannel} from 'mattermost-redux/selectors/entities/channels';
import {
    getMyChannelMemberships,
    getCurrentUserId,
} from 'mattermost-redux/selectors/entities/common';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {Action} from 'mattermost-redux/types/actions';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import {getSiteURL} from 'utils/url';
import {ModalData} from 'types/actions';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {copyToClipboard} from 'utils/utils';
import MenuItem from 'components/menu/MenuItem';
import Menu from 'components/menu/Menu';

import {unmuteChannel, muteChannel} from 'actions/channel_actions';
import {useDispatch, useSelector} from 'react-redux';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'types/store';
import {
    getCategoriesForCurrentTeam,
    getDisplayedChannels,
} from 'selectors/views/channel_sidebar';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {getCategoryInTeamWithChannel} from 'mattermost-redux/selectors/entities/channel_categories';
import {addChannelsInSidebar} from 'actions/views/channel_sidebar';
import {openModal} from 'actions/views/modals';
import EditCategoryModal from 'components/edit_category_modal/edit_category_modal';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import LeavePrivateChannelModal from 'components/leave_private_channel_modal/leave_private_channel_modal';

type Props = {
    channel: Channel;
    channelLink: string;
    location: string;
};

const SidebarChannelMenu = (props: Props): JSX.Element => {
    const {channel, channelLink, location} = props;

    const buttonReference = useRef<HTMLButtonElement>(null);
    const menuItemReference = useRef(null);
    const intl = useIntl();
    const dispatch = useDispatch<DispatchFunc>();
    const member = useSelector(
        (state: GlobalState) => getMyChannelMemberships(state)[channel.id]
    );

    const isUnread = useSelector((state: GlobalState) =>
        getDisplayedChannels(state)
    );

    const currentUserId = useSelector((state: GlobalState) =>
        getCurrentUserId(state)
    );
    const isFavorite = useSelector((state: GlobalState) =>
        isFavoriteChannel(state, channel.id)
    );
    const isMuted = useSelector((state: GlobalState) => isChannelMuted(member));
    const displayedChannels = useSelector((state: GlobalState) =>
        getDisplayedChannels(state)
    );
    const multiSelectedChannelIds = useSelector(
        (state: GlobalState) =>
            state.views.channelSidebar.multiSelectedChannelIds
    );
    const currentTeam = useSelector((state: GlobalState) =>
        getCurrentTeam(state)
    );
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
            })
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

    const favorite = () => {
        dispatch(favoriteChannel(channel.id));
        trackEvent('ui', 'ui_sidebar_channel_menu_favorite');
    };

    const unfavorite = () => {
        dispatch(unfavoriteChannel(channel.id));
        trackEvent('ui', 'ui_sidebar_channel_menu_unfavorite');
    };

    const unmute = () => {
        dispatch(unmuteChannel(currentUserId, channel.id));
    };

    const mute = () => {
        dispatch(muteChannel(currentUserId, channel.id));
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
            })
        );
        trackEvent('ui', 'ui_sidebar_channel_menu_addMembers');
    };

    let categories: ChannelCategory[] | undefined;
    let currentCategory: ChannelCategory | undefined;

    if (currentTeam) {
        categories = useSelector((state: GlobalState) =>
            getCategoriesForCurrentTeam(state)
        );
        currentCategory = useSelector((state: GlobalState) =>
            getCategoryInTeamWithChannel(state, currentTeam.id, channel.id)
        );
    }

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
                        multiSelectedChannelIds.indexOf(channel.id) === -1
                            ? [channel.id]
                            : multiSelectedChannelIds,
                },
            })
        );
        trackEvent('ui', 'ui_sidebar_channel_menu_createCategory');
    };

    const isDM =
        channel.type === Constants.DM_CHANNEL ||
        channel.type === Constants.GM_CHANNEL;
    const firstMenuGroup = {
        menuItems: [
            ...(isUnread
                ? [
                      <MenuItem
                          id={`markAsRead-${channel.id}`}
                          onClick={markAsRead}
                          label={intl.formatMessage({
                              id: 'sidebar_left.sidebar_channel_menu.markAsRead',
                              defaultMessage: 'Mark as Read',
                          })}
                          leadingElement={<i className='icon-mark-as-unread' />}
                      />,
                  ]
                : []),
            ...(isFavorite
                ? [
                      <MenuItem
                          id={`unfavorite-${channel.id}`}
                          label={intl.formatMessage({
                              id: 'sidebar_left.sidebar_channel_menu.unfavoriteChannel',
                              defaultMessage: 'Unfavorite',
                          })}
                          leadingElement={<i className='icon-star' />}
                          onClick={unfavorite}
                      />,
                  ]
                : [
                      <MenuItem
                          id={`favorite-${channel.id}`}
                          label={intl.formatMessage({
                              id: 'sidebar_left.sidebar_channel_menu.favoriteChannel',
                              defaultMessage: 'Favorite',
                          })}
                          onClick={favorite}
                          leadingElement={<i className='icon-star-outline' />}
                      />,
                  ]),
            ...(isMuted
                ? [
                      <MenuItem
                          id={`unmute-${channel.id}`}
                          label={
                              isDM
                                  ? intl.formatMessage({
                                        id: 'sidebar_left.sidebar_channel_menu.unmuteConversation',
                                        defaultMessage: 'Unmute Conversation',
                                    })
                                  : intl.formatMessage({
                                        id: 'sidebar_left.sidebar_channel_menu.unmuteChannel',
                                        defaultMessage: 'Unmute Channel',
                                    })
                          }
                          leadingElement={
                              <i className='icon-bell-off-outline' />
                          }
                          onClick={unmute}
                      />,
                  ]
                : [
                      <MenuItem
                          id={`mute-${channel.id}`}
                          label={
                              isDM
                                  ? intl.formatMessage({
                                        id: 'sidebar_left.sidebar_channel_menu.muteConversation',
                                        defaultMessage: 'Mute Conversation',
                                    })
                                  : intl.formatMessage({
                                        id: 'sidebar_left.sidebar_channel_menu.muteChannel',
                                        defaultMessage: 'Mute Channel',
                                    })
                          }
                          onClick={mute}
                          leadingElement={<i className='icon-bell-outline' />}
                      />,
                  ]),
        ],
    };

    const secondMenuGroup = {
        menuItems: [
            ...(!isDM
                ? [
                      <MenuItem
                          id={`copyLink-${channel.id}`}
                          onClick={copyLink}
                          label={intl.formatMessage({
                              id: 'sidebar_left.sidebar_channel_menu.copyLink',
                              defaultMessage: 'Copy Link',
                          })}
                          leadingElement={<i className='icon-link-variant' />}
                      />,
                  ]
                : []),
            <MenuItem
                id={`addMembers-${channel.id}`}
                onClick={addMembers}
                label={intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.addMembers',
                    defaultMessage: 'Add Members',
                })}
                leadingElement={<i className='icon-account-outline' />}
            />,
            ...(channel.name !== Constants.DEFAULT_CHANNEL
                ? [
                      <MenuItem
                          id={`leave-${channel.id}`}
                          onClick={getCloseHandler}
                          label={
                              isDM
                                  ? intl.formatMessage({
                                        id: 'sidebar_left.sidebar_channel_menu.leaveConversation',
                                        defaultMessage: 'Close Conversation',
                                    })
                                  : intl.formatMessage({
                                        id: 'sidebar_left.sidebar_channel_menu.leaveChannel',
                                        defaultMessage: 'Leave Channel',
                                    })
                          }
                          leadingElement={<i className='icon-close' />}
                      />,
                  ]
                : []),
        ],
    };

    let filteredCategories = categories?.filter(
        (category) => category.type !== CategoryTypes.DIRECT_MESSAGES
    );

    if (location === 'sidebar') {
        const selectedChannels =
            multiSelectedChannelIds.indexOf(channel.id) === -1
                ? [channel]
                : displayedChannels.filter(
                      (c) => multiSelectedChannelIds.indexOf(c.id) !== -1
                  );
        const allChannelsAreDMs = selectedChannels.every(
            (selectedChannel) =>
                selectedChannel.type === Constants.DM_CHANNEL ||
                selectedChannel.type === Constants.GM_CHANNEL
        );
        const allChannelsAreNotDMs = selectedChannels.every(
            (selectedChannel) =>
                selectedChannel.type !== Constants.DM_CHANNEL &&
                selectedChannel.type !== Constants.GM_CHANNEL
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
                <MenuItem
                    id={`moveToCategory-${channel.id}-${category.id}`}
                    onClick={() => moveToCategory(category.id)}
                    label={category.display_name}
                    leadingElement={
                        category.type === CategoryTypes.FAVORITES ? (
                            <i className='icon-star-outline' />
                        ) : (
                            <i className='icon-folder-outline' />
                        )
                    }
                />
            );
        }
    );

    const submenuTrigger = {
        menuItems: [
            <MenuItem
                id={`moveTo-${channel.id}`}
                ref={menuItemReference}
                label={intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.moveTo',
                    defaultMessage: 'Move to...',
                })}
                leadingElement={
                    location === 'sidebar' ? (
                        <i className='icon-folder-move-outline' />
                    ) : null
                }
                trailingElementLabel='selected'
                trailingElement={<i className='icon-chevron-right' />}
            />,
        ],
    };

    const submenuGroup = {
        menuItems: [
            categoryMenuItems,
            <MenuItem
                id={`moveToNewCategory-${channel.id}`}
                label={intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.moveToNewCategory',
                    defaultMessage: 'New Category',
                })}
                onClick={moveToNewCategory}
            />,
        ],
    };

    return (
        <>
            <Menu
                id={`SidebarChannelMenu-${channel.id}`}
                title={intl.formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel',
                    defaultMessage: 'Channel Menu',
                })}
                trigger={buttonReference}
                submenuTrigger={menuItemReference}
                groups={[firstMenuGroup, submenuTrigger, secondMenuGroup]}
                submenuGroups={[submenuGroup]}
            ></Menu>
        </>
    );
};

export default SidebarChannelMenu;
