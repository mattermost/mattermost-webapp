// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {
    getDarkTheme,
    getDefaultLightTheme,
    getEnableThemeSync,
    getLightTheme, getTheme,
    makeGetCategory,
} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';

import {getAllowCustomThemes, getOsColorScheme} from 'mattermost-redux/selectors/entities/general';

import {getCurrentTeamId, getMyTeamsCount} from 'mattermost-redux/selectors/entities/teams';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {deleteTeamSpecificThemes, savePreferences} from 'mattermost-redux/actions/preferences';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {Preferences} from 'mattermost-redux/constants';

import {getAllowedThemes} from '../../../../../selectors/theme';

import Expanded, {Actions} from './expanded';

const mapStateToProps = (state: GlobalState) => {
    const getThemeCategory = makeGetCategory();

    return {
        allowCustomThemes: getAllowCustomThemes(state),
        currentTeamId: getCurrentTeamId(state),
        enableThemeSync: getEnableThemeSync(state),
        osColorScheme: getOsColorScheme(state),
        applyToAllTeams: getThemeCategory(state, Preferences.CATEGORY_THEME).length <= 1,
        showAllTeamsCheckbox: getMyTeamsCount(state) > 1,
        userId: getCurrentUserId(state),
        allowedThemes: getAllowedThemes(state),
        lightTheme: getLightTheme(state),
        darkTheme: getDarkTheme(state),
        theme: getTheme(state),
        defaultLightTheme: getDefaultLightTheme(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>) => ({
    actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
        savePreferences,
        deleteTeamSpecificThemes,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Expanded);
