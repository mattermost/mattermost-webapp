// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect, ConnectedProps} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {
    getConfig,
    getLicense,
    getSubscriptionStats as selectSubscriptionStats,
} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getSubscriptionStats} from 'mattermost-redux/actions/cloud';

import {GlobalState} from 'types/store';

import {isAdmin} from 'mattermost-redux/utils/user_utils';

import InvitationModalGuestsStep from './invitation_modal_guests_step';

function mapStateToProps(state: GlobalState) {
    return {
        userLimit: getConfig(state).ExperimentalCloudUserLimit,
        userIsAdmin: isAdmin(getCurrentUser(state).roles),
        isCloud: getLicense(state).Cloud === 'true',
        subscriptionStats: selectSubscriptionStats(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({getSubscriptionStats}, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(InvitationModalGuestsStep);
