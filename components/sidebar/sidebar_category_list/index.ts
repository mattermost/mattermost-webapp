// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getSortedUnreadChannelIds, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetCategoriesForTeam} from 'mattermost-redux/selectors/entities/channel_categories';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GenericAction} from 'mattermost-redux/types/actions';

import {switchToChannelById} from 'actions/views/channel';
import {close} from 'actions/views/lhs';
import {isUnreadFilterEnabled, makeGetCurrentlyDisplayedChannelsForTeam} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';

import SidebarCategoryList from './sidebar_category_list';

function makeMapStateToProps() {
    const getCategoriesForTeam = makeGetCategoriesForTeam();
    const getCurrentlyDisplayedChannelsForTeam = makeGetCurrentlyDisplayedChannelsForTeam();

    return (state: GlobalState) => {
        const lastUnreadChannel = state.views.channel.keepChannelIdAsUnread;
        const currentTeam = getCurrentTeam(state);

        return {
            currentTeam,
            currentChannel: getCurrentChannel(state),
            categories: getCategoriesForTeam(state, currentTeam.id),
            isUnreadFilterEnabled: isUnreadFilterEnabled(state),
            unreadChannelIds: getSortedUnreadChannelIds(state, lastUnreadChannel, false, false, 'alpha'),
            displayedChannels: getCurrentlyDisplayedChannelsForTeam(state, currentTeam.id),
        };
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

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategoryList);
