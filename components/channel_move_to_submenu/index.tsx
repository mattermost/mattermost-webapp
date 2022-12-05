// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {
    FolderOutlineIcon,
    StarOutlineIcon,
    FolderMoveOutlineIcon,
} from '@mattermost/compass-icons/components';

import {Channel} from '@mattermost/types/channels';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import {ChannelCategory} from '@mattermost/types/channel_categories';

import {getCategoryInTeamWithChannel} from 'mattermost-redux/selectors/entities/channel_categories';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';

import {GlobalState} from 'types/store';

import {getCategoriesForCurrentTeam, getDisplayedChannels} from 'selectors/views/channel_sidebar';

import Constants, {ModalIdentifiers} from 'utils/constants';

import {trackEvent} from 'actions/telemetry_actions';
import {addChannelsInSidebar} from 'actions/views/channel_sidebar';
import {openModal} from 'actions/views/modals';

import EditCategoryModal from 'components/edit_category_modal';
import {SubMenu, MenuItem, MenuDivider} from 'components/menu';
import {PopoverMenuItem} from 'components/menu_item_types/popover_menu_item';
import {PopoverSubMenuItem} from 'components/menu_item_types/popover_sub_menu_item';

type Props = {
    channel: Channel;
    inSidebar?: boolean;
};

const ChannelMoveToSubmenu = (props: Props) => {
    const {formatMessage} = useIntl();

    const dispatch = useDispatch<DispatchFunc>();

    const displayedChannels = useSelector(getDisplayedChannels);
    const multiSelectedChannelIds = useSelector((state: GlobalState) => state.views.channelSidebar.multiSelectedChannelIds);

    const currentTeam = useSelector(getCurrentTeam);
    const categories = useSelector((state: GlobalState) => {
        return currentTeam ? getCategoriesForCurrentTeam(state) : undefined;
    });
    const currentCategory = useSelector((state: GlobalState) => {
        return currentTeam ? getCategoryInTeamWithChannel(state, currentTeam?.id || '', props.channel.id) : undefined;
    });

    if (!categories) {
        return null;
    }

    function handleMoveToCategory(categoryId: string) {
        if (currentCategory?.id !== categoryId) {
            dispatch(addChannelsInSidebar(categoryId, props.channel.id));
            trackEvent('ui', 'ui_sidebar_channel_menu_moveToExistingCategory');
        }
    }

    function handleMoveToNewCategory() {
        dispatch(openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
            dialogProps: {
                channelIdsToAdd: multiSelectedChannelIds.indexOf(props.channel.id) === -1 ? [props.channel.id] : multiSelectedChannelIds,
            },
        }));
        trackEvent('ui', 'ui_sidebar_channel_menu_createCategory');
    }

    let filteredCategories: ChannelCategory[] = [];
    if (props.inSidebar) {
        const selectedChannels = multiSelectedChannelIds.indexOf(props.channel.id) === -1 ? [props.channel] : displayedChannels.filter((c) => multiSelectedChannelIds.indexOf(c.id) !== -1);
        const allChannelsAreDMs = selectedChannels.every((selectedChannel) => selectedChannel.type === Constants.DM_CHANNEL || selectedChannel.type === Constants.GM_CHANNEL);
        const allChannelsAreNotDMs = selectedChannels.every((selectedChannel) => selectedChannel.type !== Constants.DM_CHANNEL && selectedChannel.type !== Constants.GM_CHANNEL);

        filteredCategories = categories?.filter((category) => {
            if (allChannelsAreDMs) {
                return category.type !== CategoryTypes.CHANNELS;
            } else if (allChannelsAreNotDMs) {
                return category.type !== CategoryTypes.DIRECT_MESSAGES;
            }
            return true;
        });
    } else {
        filteredCategories = categories.filter((category) => category.type !== CategoryTypes.DIRECT_MESSAGES);
    }

    function getCategoryDisplayName(categoryType: ChannelCategory['type'], categoryDisplayName: ChannelCategory['display_name']) {
        if (categoryType === CategoryTypes.FAVORITES) {
            return formatMessage({id: 'sidebar_left.sidebar_channel_menu.favorites', defaultMessage: 'Favorites'});
        }
        if (categoryType === CategoryTypes.CHANNELS) {
            return formatMessage({id: 'sidebar_left.sidebar_channel_menu.channels', defaultMessage: 'Channels'});
        }
        return categoryDisplayName;
    }

    return (
        <SubMenu
            triggerId={`moveTo-${props.channel.id}`}
            triggerElement={
                <PopoverSubMenuItem
                    leadingElement={<FolderMoveOutlineIcon size={18}/>}
                    primaryLabel={formatMessage({id: 'sidebar_left.sidebar_channel_menu.moveTo', defaultMessage: 'Move to...'})}
                />
            }
            menuId={`SidebarChannelMenu-ChannelMoveToSubmenu-${props.channel.id}`}
        >
            {filteredCategories.map((category: ChannelCategory) => (
                <MenuItem
                    id={`moveToCategory-${props.channel.id}-${category.id}`}
                    key={`moveToCategory-${props.channel.id}-${category.id}`}
                    onClick={() => handleMoveToCategory(category.id)}
                >
                    {category.type === CategoryTypes.FAVORITES ? (
                        <StarOutlineIcon
                            size={16}
                        />
                    ) : (
                        <FolderOutlineIcon
                            size={16}
                        />
                    )}
                    {getCategoryDisplayName(category.type, category.display_name)}
                </MenuItem>
            ))}
            <MenuDivider/>
            <MenuItem
                id={`moveToNewCategory-${props.channel.id}`}
                onClick={handleMoveToNewCategory}
            >
                <PopoverMenuItem
                    leadingElement={<FolderOutlineIcon size={16}/>}
                    primaryLabel={formatMessage({id: 'sidebar_left.sidebar_channel_menu.moveToNewCategory', defaultMessage: 'New Category'})}
                />
            </MenuItem>
        </SubMenu>
    );
};

export default ChannelMoveToSubmenu;
