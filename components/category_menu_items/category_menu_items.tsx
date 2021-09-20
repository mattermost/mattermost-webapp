// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {getCategoryInTeamWithChannel} from 'mattermost-redux/selectors/entities/channel_categories';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import {trackEvent} from 'actions/telemetry_actions';
import {addChannelsInSidebar} from 'actions/views/channel_sidebar';
import {openModal} from 'actions/views/modals';
import EditCategoryModal from 'components/edit_category_modal';
import Menu from 'components/widgets/menu/menu';
import {getCategoriesForCurrentTeam, getDisplayedChannels} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';
import Constants, {ModalIdentifiers} from 'utils/constants';

type Props = {
    channel: Channel;
    openUp: boolean;
    location?: string | 'sidebar' | 'channel';
};

const CategoryMenuItems = (props: Props): JSX.Element | null => {
    const {channel, openUp, location} = props;
    const intl = useIntl();
    const dispatch = useDispatch<DispatchFunc>();
    const displayedChannels = useSelector((state: GlobalState) => getDisplayedChannels(state));
    const multiSelectedChannelIds = useSelector((state: GlobalState) => state.views.channelSidebar.multiSelectedChannelIds);
    const currentTeam = useSelector((state: GlobalState) => getCurrentTeam(state));

    let categories: ChannelCategory[] | undefined;
    let currentCategory: ChannelCategory | undefined;

    if (currentTeam) {
        categories = useSelector((state: GlobalState) => getCategoriesForCurrentTeam(state));
        currentCategory = useSelector((state: GlobalState) => getCategoryInTeamWithChannel(state, currentTeam.id, channel.id));
    }

    if (!categories) {
        return null;
    }

    const moveToCategory = (categoryId: string) => {
        if (currentCategory?.id !== categoryId) {
            dispatch(addChannelsInSidebar(categoryId, channel.id));
            trackEvent('ui', 'ui_sidebar_channel_menu_moveToExistingCategory');
        }
    };

    const moveToNewCategory = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
            dialogProps: {
                channelIdsToAdd: multiSelectedChannelIds.indexOf(channel.id) === -1 ? [channel.id] : multiSelectedChannelIds,
            },
        }));
        trackEvent('ui', 'ui_sidebar_channel_menu_createCategory');
    };

    let filteredCategories = categories.filter((category) => category.type !== CategoryTypes.DIRECT_MESSAGES);

    if (location === 'sidebar') {
        const selectedChannels = multiSelectedChannelIds.indexOf(channel.id) === -1 ? [channel] : displayedChannels.filter((c) => multiSelectedChannelIds.indexOf(c.id) !== -1);
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
    }

    const categoryMenuItems = filteredCategories.map((category: ChannelCategory) => {
        return {
            id: `moveToCategory-${channel.id}-${category.id}`,
            icon: category.type === CategoryTypes.FAVORITES ? (<i className='icon-star-outline'/>) : (<i className='icon-folder-outline'/>),
            direction: 'right' as any,
            text: category.display_name,
            action: () => moveToCategory(category.id),
        } as any;
    });

    categoryMenuItems.push(
        {
            id: 'ChannelMenu-moveToDivider',
            text: (<li className='MenuGroup menu-divider'/>),
        },
        {
            id: `moveToNewCategory-${channel.id}`,
            icon: (<i className='icon-folder-move-outline'/>),
            direction: 'right' as any,
            text: intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.moveToNewCategory', defaultMessage: 'New Category'}),
            action: moveToNewCategory,
        },
    );

    return (
        <React.Fragment>
            <Menu.Group>
                <Menu.ItemSubMenu
                    id={`moveTo-${channel.id}`}
                    subMenu={categoryMenuItems}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.moveTo', defaultMessage: 'Move to...'})}
                    direction={'right' as any}
                    icon={location === 'sidebar' ? <i className='icon-folder-move-outline'/> : null}
                    openUp={openUp}
                    styleSelectableItem={true}
                    selectedValueText={currentCategory?.display_name}
                    renderSelected={false}
                />
            </Menu.Group>
        </React.Fragment>
    );
};

export default CategoryMenuItems;
