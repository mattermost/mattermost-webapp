// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {
    getConfig,
    getLicense,
    getSubscriptionStats,
} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import {isAdmin} from 'utils/utils.jsx';

import InvitationModalGuestsStep from './invitation_modal_guests_step';

function mapStateToProps(state: GlobalState) {
    return {
        userLimit: getConfig(state).ExperimentalCloudUserLimit,
        userIsAdmin: isAdmin(getCurrentUser(state).roles),
        isCloud: getLicense(state).Cloud === 'true',
        subscriptionStats: getSubscriptionStats(state),
    };
}

export default connect(mapStateToProps)(InvitationModalGuestsStep);
