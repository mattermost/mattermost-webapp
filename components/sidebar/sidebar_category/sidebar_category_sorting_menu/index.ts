// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';

import {setCategorySorting} from 'mattermost-redux/actions/channel_categories';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'mattermost-redux/constants';

import {GlobalState} from 'types/store';

import Constants from 'utils/constants';

import SidebarCategorySortingMenu from './sidebar_category_sorting_menu';

function mapStateToProps() {
    return (state: GlobalState) => {
        const selectedDmNumber = getInt(state, Preferences.CATEGORY_SIDEBAR_SETTINGS, Preferences.LIMIT_VISIBLE_DMS_GMS, Constants.DEFAULT_DM_NUMBER);

        return {
            selectedDmNumber,
            currentUserId: getCurrentUserId(state),
        };
    };
}

const mapDispatchToProps = {
    setCategorySorting,
    savePreferences,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SidebarCategorySortingMenu);
