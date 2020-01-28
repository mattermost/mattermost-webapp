// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getOrderedChannelIds, getSortedUnreadChannelIds, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getSidebarPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import SidebarCategoryList from './sidebar_category_list';

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

    const categories = orderedChannelIds.map((channelCategory) => {
        return {
            id: channelCategory.type,
            display_name: channelCategory.name,
            collapsed: false,
            channel_ids: channelCategory.items,
        };
    });

    return {
        currentChannel: getCurrentChannel(state),
        categories,
        unreadChannelIds: getSortedUnreadChannelIds(state, lastUnreadChannel, false, false, 'alpha'),    // This function call doesn't need to be 5 arguments does it?
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarCategoryList);
