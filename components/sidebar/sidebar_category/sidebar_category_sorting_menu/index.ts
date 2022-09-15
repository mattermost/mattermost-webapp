// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {setCategorySorting} from 'mattermost-redux/actions/channel_categories';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {GenericAction} from 'mattermost-redux/types/actions';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'mattermost-redux/constants';

import {GlobalState} from 'types/store';

import Constants from 'utils/constants';

import SidebarCategorySortingMenu from './sidebar_category_sorting_menu';

function mapStateToProps() {
    return (state: GlobalState) => {
        const currentUser = getCurrentUser(state)
        const defaultValue = currentUser.create_at > Constants.TIMESTAMP_FOR_DEFAULT_DM_NUMBER ? 40 : 20;
        const selectedDmNumber = getInt(state, Preferences.CATEGORY_SIDEBAR_SETTINGS, Preferences.LIMIT_VISIBLE_DMS_GMS, defaultValue);

        return {
            selectedDmNumber,
            currentUserId: currentUser.id,
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

export default connect(mapStateToProps, mapDispatchToProps)(SidebarCategorySortingMenu);
