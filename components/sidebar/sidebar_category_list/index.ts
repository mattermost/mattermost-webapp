// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getOrderedChannelIds, getSortedUnreadChannelIds, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getSidebarPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {GenericAction} from 'mattermost-redux/types/actions';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import {switchToChannelById} from 'actions/views/channel';
import {close} from 'actions/views/lhs';
import {isUnreadFilterEnabled} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';

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
const categoriesFunc = memoizeResult(getCategoryFromChannel);

// TODO: temp typing until we fix redux
function mapStateToProps(state: GlobalState) {
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

    const categories = categoriesFunc(orderedChannelIds);

    return {
        currentTeam: getCurrentTeam(state),
        currentChannel: getCurrentChannel(state),
        categories,
        isUnreadFilterEnabled: isUnreadFilterEnabled(state),
        unreadChannelIds: getSortedUnreadChannelIds(state, lastUnreadChannel, false, false, 'alpha'), // This function call doesn't need to be 5 arguments does it?
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            close,
            switchToChannelById,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarCategoryList);
