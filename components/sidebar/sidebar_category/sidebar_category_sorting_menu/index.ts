// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {setCategorySorting} from 'mattermost-redux/actions/channel_categories';
import {GenericAction} from 'mattermost-redux/types/actions';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {makeGetCategoriesForTeam} from 'mattermost-redux/selectors/entities/channel_categories';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {limitVisibleDMsGMs} from 'actions/channel_actions';

import {GlobalState} from 'types/store';

import SidebarCategorySortingMenu from './sidebar_category_sorting_menu';

type OwnProps = {
    category: ChannelCategory;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
}
function makeMapStateToProps() {
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return (state: GlobalState, ownProps: OwnProps) => {
        let categories;
        const currentTeam = getCurrentTeam(state);

        if (currentTeam) {
            categories = getCategoriesForTeam(state, currentTeam.id);
        }

        return {
            categories,
            category: ownProps.category,
            handleOpenMoreDirectChannelsModal: ownProps.handleOpenMoreDirectChannelsModal,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            setCategorySorting,
            limitVisibleDMsGMs,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategorySortingMenu);
