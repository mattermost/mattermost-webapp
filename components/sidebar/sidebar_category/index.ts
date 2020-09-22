// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {setCategorySorting} from 'mattermost-redux/actions/channel_categories';
import {makeGetChannelsForCategory} from 'mattermost-redux/selectors/entities/channel_categories';
import {GenericAction} from 'mattermost-redux/types/actions';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import {setCategoryCollapsed} from 'actions/views/channel_sidebar';
import {isCategoryCollapsed, getDraggingState} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';

import SidebarCategory from './sidebar_category';

type OwnProps = {
    category: ChannelCategory;
}

function makeMapStateToProps() {
    const getChannelsForCategory = makeGetChannelsForCategory();

    return (state: GlobalState, ownProps: OwnProps) => {
        return {
            isCollapsed: isCategoryCollapsed(state, ownProps.category.id),
            channels: getChannelsForCategory(state, ownProps.category),
            draggingState: getDraggingState(state),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            setCategoryCollapsed,
            setCategorySorting,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategory);
