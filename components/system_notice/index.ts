// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {bindActionCreators, Dispatch} from 'redux';

// @ts-ignore
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';

// @ts-ignore
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

// @ts-ignore
import {haveISystemPermission} from 'mattermost-redux/selectors/entities/roles';

// @ts-ignore
import {savePreferences} from 'mattermost-redux/actions/preferences';

// @ts-ignore
import {Permissions} from 'mattermost-redux/constants';

// @ts-ignore
import {getStandardAnalytics} from 'mattermost-redux/actions/admin';

import {dismissNotice} from 'actions/views/notice';
import {Preferences} from 'utils/constants';

import Notices from './notices.jsx';
import SystemNotice from './system_notice.jsx';

function makeMapStateToProps() {
    const getCategory = makeGetCategory();

    const getPreferenceNameMap = createSelector(
        getCategory,
        (preferences: any[]) => {
            const nameMap: any = {};
            preferences.forEach((p) => {
                nameMap[p.name] = p;
            });
            return nameMap;
        }
    );

    return function mapStateToProps(state: any) {
        const license = getLicense(state);
        const config = getConfig(state);
        const serverVersion = state.entities.general.serverVersion;
        const analytics = state.entities.admin.analytics;

        return {
            currentUserId: state.entities.users.currentUserId,

            // @ts-ignore
            preferences: getPreferenceNameMap(state, Preferences.CATEGORY_SYSTEM_NOTICE),
            dismissedNotices: state.views.notice.hasBeenDismissed,
            isSystemAdmin: haveISystemPermission(state, {permission: Permissions.MANAGE_SYSTEM}),
            notices: Notices,
            config,
            license,
            serverVersion,
            analytics,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
            dismissNotice,
            getStandardAnalytics,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SystemNotice);
