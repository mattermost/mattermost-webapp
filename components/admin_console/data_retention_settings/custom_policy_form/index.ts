// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */

import {connect} from 'react-redux';

import {getDataRetentionCustomPolicy as fetchPolicy, getDataRetentionCustomPolicyTeams as fetchPolicyTeams} from 'mattermost-redux/actions/admin';
import {getDataRetentionCustomPolicy} from 'mattermost-redux/selectors/entities/admin';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {DataRetentionCustomPolicy} from 'mattermost-redux/types/data_retention';
import {Team} from 'mattermost-redux/types/teams';

import {GlobalState} from 'types/store';

import CustomPolicyForm from './custom_policy_form';

type Actions = {
    fetchPolicy: (id: string) => Promise<{ data: DataRetentionCustomPolicy }>;
    fetchPolicyTeams: (id: string) => Promise<{ data: Team[] }>;
};

type OwnProps = {
    match: {
        params: {
            policy_id: string;
        };
    };
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const policyId = ownProps.match.params.policy_id;
    const policy = getDataRetentionCustomPolicy(state, policyId) || {};

    return {
        policyId,
        policy,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            fetchPolicy: fetchPolicy,
            fetchPolicyTeams: fetchPolicyTeams,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomPolicyForm);
