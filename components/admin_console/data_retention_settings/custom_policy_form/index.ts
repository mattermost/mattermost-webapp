// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */

import {connect} from 'react-redux';

import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {getTeamsInPolicy} from 'mattermost-redux/selectors/entities/teams';
import {
    getDataRetentionCustomPolicy as fetchPolicy,
    getDataRetentionCustomPolicyTeams as fetchPolicyTeams,
    createDataRetentionCustomPolicy,
    updateDataRetentionCustomPolicy,
    addDataRetentionCustomPolicyTeams,
    removeDataRetentionCustomPolicyTeams,
    addDataRetentionCustomPolicyChannels,
    removeDataRetentionCustomPolicyChannels,
} from 'mattermost-redux/actions/admin';
import {getDataRetentionCustomPolicy} from 'mattermost-redux/selectors/entities/admin';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {
    DataRetentionCustomPolicy,
    CreateDataRetentionCustomPolicy,
    PatchDataRetentionCustomPolicy,
    PatchDataRetentionCustomPolicyTeams,
    PatchDataRetentionCustomPolicyChannels,
} from 'mattermost-redux/types/data_retention';
import {Team} from 'mattermost-redux/types/teams';

import {GlobalState} from 'types/store';

import {ChannelWithTeamData} from 'mattermost-redux/types/channels';

import {setNavigationBlocked} from 'actions/admin_actions.jsx';

import CustomPolicyForm from './custom_policy_form';

type Actions = {
    fetchPolicy: (id: string) => Promise<{ data: DataRetentionCustomPolicy }>;
    fetchPolicyTeams: (id: string, page: number, perPage: number) => Promise<{ data: Team[] }>;
    createDataRetentionCustomPolicy: (policy: CreateDataRetentionCustomPolicy) => Promise<{ data: DataRetentionCustomPolicy }>;
    updateDataRetentionCustomPolicy: (id: string, policy: PatchDataRetentionCustomPolicy) => Promise<{ data: DataRetentionCustomPolicy }>;
    addDataRetentionCustomPolicyTeams: (id: string, policy: PatchDataRetentionCustomPolicyTeams) => Promise<{ data: Team[] }>;
    removeDataRetentionCustomPolicyTeams: (id: string, policy: PatchDataRetentionCustomPolicyTeams) => Promise<{ data: Team[] }>;
    addDataRetentionCustomPolicyChannels: (id: string, policy: PatchDataRetentionCustomPolicyChannels) => Promise<{ data: ChannelWithTeamData[] }>;
    removeDataRetentionCustomPolicyChannels: (id: string, policy: PatchDataRetentionCustomPolicyChannels) => Promise<{ data: ChannelWithTeamData[] }>;
    setNavigationBlocked: (blocked: boolean) => void;
};

type OwnProps = {
    match: {
        params: {
            policy_id: string;
        };
    };
}

function mapStateToProps() {
    const getPolicyTeams = getTeamsInPolicy();
    return (state: GlobalState, ownProps: OwnProps) => {
        const policyId = ownProps.match.params.policy_id;
        const policy = getDataRetentionCustomPolicy(state, policyId) || {};
        const teams = getPolicyTeams(state, {policyId});
        return {
            policyId,
            policy,
            teams,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            fetchPolicy,
            fetchPolicyTeams,
            createDataRetentionCustomPolicy,
            updateDataRetentionCustomPolicy,
            addDataRetentionCustomPolicyTeams,
            removeDataRetentionCustomPolicyTeams,
            addDataRetentionCustomPolicyChannels,
            removeDataRetentionCustomPolicyChannels,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomPolicyForm);
