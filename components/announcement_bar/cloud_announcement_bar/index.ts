// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {GenericAction} from 'mattermost-redux/types/actions';
import {getStandardAnalytics} from 'mattermost-redux/actions/admin';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCloudSubscription} from 'mattermost-redux/actions/cloud';

import {getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {openModal} from 'actions/views/modals';

import {GlobalState} from 'types/store';

import {Preferences} from 'utils/constants';

import UserLimitAnnouncementBar from './user_limit_announcement_bar';

function mapStateToProps(state: GlobalState) {
    const getCategory = makeGetCategory();
    return {
        userLimit: parseInt(getConfig(state).ExperimentalCloudUserLimit!, 10),
        analytics: state.entities.admin.analytics,
        userIsAdmin: isCurrentUserSystemAdmin(state),
        currentUser: getCurrentUser(state),
        isCloud: getLicense(state).Cloud === 'true',
        subscription: state.entities.cloud.subscription,
        preferences: getCategory(state, Preferences.CLOUD_UPGRADE_BANNER),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators(
            {
                savePreferences,
                getStandardAnalytics,
                openModal,
                getCloudSubscription,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserLimitAnnouncementBar);
