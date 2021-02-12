// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {moveCategory} from 'mattermost-redux/actions/channel_categories';
import {getCurrentChannelId, getUnreadChannelIds} from 'mattermost-redux/selectors/entities/channels';
import {shouldShowUnreadsCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GenericAction} from 'mattermost-redux/types/actions';

import {switchToChannelById} from 'actions/views/channel';
import {
    expandCategory,
    moveChannelsInSidebar,
    setDraggingState,
    stopDragging,
    clearChannelSelection,
    multiSelectChannelAdd,
} from 'actions/views/channel_sidebar';
import {close} from 'actions/views/lhs';
import {
    getDisplayedChannels,
    getDraggingState,
    getCategoriesForCurrentTeam,
    isUnreadFilterEnabled,
} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';

import SidebarChannelList from './sidebar_channel_list';

function mapStateToProps(state: GlobalState) {
    const currentTeam = getCurrentTeam(state);

    return {
        currentTeam,
        currentChannelId: getCurrentChannelId(state),
        categories: getCategoriesForCurrentTeam(state),
        isUnreadFilterEnabled: isUnreadFilterEnabled(state),
        unreadChannelIds: getUnreadChannelIds(state),
        displayedChannels: getDisplayedChannels(state),
        draggingState: getDraggingState(state),
        newCategoryIds: state.views.channelSidebar.newCategoryIds,
        multiSelectedChannelIds: state.views.channelSidebar.multiSelectedChannelIds,
        showUnreadsCategory: shouldShowUnreadsCategory(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            close,
            switchToChannelById,
            moveChannelsInSidebar,
            moveCategory,
            setDraggingState,
            stopDragging,
            expandCategory,
            clearChannelSelection,
            multiSelectChannelAdd,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarChannelList);
