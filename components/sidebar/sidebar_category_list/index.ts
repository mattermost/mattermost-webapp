// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getOrderedChannelIds} from 'mattermost-redux/selectors/entities/channels';
import {getSidebarPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import SidebarCategoryList from './sidebar_category_list';

type ChannelCategory = {
    type: string;
    name: string;
    items: string[];
}

function getCategoryFromChannel(channelCategories: ChannelCategory[]) {
    return channelCategories.map((channelCategory) => {
        return {
            id: channelCategory.type,
            display_name: channelCategory.name,
            collapsed: false,
            channel_ids: channelCategory.items,
        };
    });
}

// TODO: temp typing until we fix redux
function mapStateToProps(state: GlobalState & {views: any}) {
    // TODO: temp
    const sidebarPrefs = getSidebarPreferences(state);
    const lastUnreadChannel = state.views.channel.keepChannelIdAsUnread;
    const orderedChannelIds = getOrderedChannelIds(
        state,
        lastUnreadChannel,
        sidebarPrefs.grouping,
        sidebarPrefs.sorting,
        sidebarPrefs.unreads_at_top === 'true',
        sidebarPrefs.favorite_at_top === 'true',
    );

    const categoriesFunc = memoizeResult(getCategoryFromChannel);
    const categories = categoriesFunc(orderedChannelIds);

    return {
        categories,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarCategoryList);
