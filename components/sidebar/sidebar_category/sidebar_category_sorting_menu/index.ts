// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {setCategorySorting} from 'mattermost-redux/actions/channel_categories';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {GenericAction} from 'mattermost-redux/types/actions';
import {makeGetCategoriesForTeam} from 'mattermost-redux/selectors/entities/channel_categories';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import SidebarCategorySortingMenu from './sidebar_category_sorting_menu';

function makeMapStateToProps() {
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return (state: GlobalState) => {
        let categories;
        const currentTeam = getCurrentTeam(state);

        if (currentTeam) {
            categories = getCategoriesForTeam(state, currentTeam.id);
        }

        return {
            categories,
            currentUserId: getCurrentUserId(state),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            setCategorySorting,
            savePreferences,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategorySortingMenu);
