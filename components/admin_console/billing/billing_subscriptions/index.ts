// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {GenericAction} from 'mattermost-redux/types/actions';
import {getStandardAnalytics} from 'mattermost-redux/actions/admin';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {savePreferences} from 'mattermost-redux/actions/preferences';

import {getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import {Preferences} from 'utils/constants';

import BillingSubscriptions from './billing_subscriptions';

function mapStateToProps(state: GlobalState) {
    const getCategory = makeGetCategory();
    return {
        userLimit: parseInt(getConfig(state).ExperimentalCloudUserLimit!, 10),
        analytics: state.entities.admin.analytics,
        userIsAdmin: isCurrentUserSystemAdmin(state),
        currentUser: getCurrentUser(state),
        isCloud: getLicense(state).Cloud === 'true',
        preferences: getCategory(state, Preferences.ADMIN_CLOUD_UPGRADE_PANEL),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators(
            {
                getStandardAnalytics,
                savePreferences,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BillingSubscriptions);

