// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {
    getConfig,
    getLicense,
} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser, getFilteredUsersStats as selectFilteredUsersStats} from 'mattermost-redux/selectors/entities/users';
import {getStandardAnalytics} from 'mattermost-redux/actions/admin';
import {getFilteredUsersStats} from 'mattermost-redux/actions/users';
import {bindActionCreators, Dispatch} from 'redux';
import {GenericAction} from 'mattermost-redux/types/actions';
import {UsersStats} from 'mattermost-redux/types/users';
import {getCloudSubscription} from 'mattermost-redux/actions/cloud';

import {GlobalState} from 'types/store';

import {isAdmin} from 'utils/utils.jsx';

import InvitationModalMembersStep from './invitation_modal_members_step';

function mapStateToProps(state: GlobalState) {
    const filteredUserStats: UsersStats = selectFilteredUsersStats(state);
    const analytics = isAdmin(getCurrentUser(state).roles) ? state.entities.admin.analytics : {TOTAL_USERS: filteredUserStats.total_users_count};
    return {
        userLimit: getConfig(state).ExperimentalCloudUserLimit,
        analytics,
        userIsAdmin: isAdmin(getCurrentUser(state).roles),
        isCloud: getLicense(state).Cloud === 'true',
        subscription: state.entities.cloud.subscription,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators(
            {
                getStandardAnalytics,
                getCloudSubscription,
                getFilteredUsersStats,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InvitationModalMembersStep);
