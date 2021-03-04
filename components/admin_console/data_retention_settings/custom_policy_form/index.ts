// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */

import {connect} from 'react-redux';
import {createSelector} from 'reselect';

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
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {
    DataRetentionCustomPolicy, 
    CreateDataRetentionCustomPolicy, 
    PatchDataRetentionCustomPolicy, 
    PatchDataRetentionCustomPolicyTeams, 
    PatchDataRetentionCustomPolicyChannels
} from 'mattermost-redux/types/data_retention';
import {Team} from 'mattermost-redux/types/teams';

import {GlobalState} from 'types/store';

import CustomPolicyForm from './custom_policy_form';
import { ChannelWithTeamData } from 'mattermost-redux/types/channels';

type Actions = {
    fetchPolicy: (id: string) => Promise<{ data: DataRetentionCustomPolicy }>;
    fetchPolicyTeams: (id: string, page: number, perPage: number) => Promise<{ data: Team[] }>;
    createDataRetentionCustomPolicy: (policy: CreateDataRetentionCustomPolicy) => Promise<{ data: DataRetentionCustomPolicy }>;
    updateDataRetentionCustomPolicy: (id: string, policy: PatchDataRetentionCustomPolicy) => Promise<{ data: DataRetentionCustomPolicy }>;
    addDataRetentionCustomPolicyTeams: (id: string, policy: PatchDataRetentionCustomPolicyTeams) => Promise<{ data: Team[] }>;
    removeDataRetentionCustomPolicyTeams: (id: string, policy: PatchDataRetentionCustomPolicyTeams) => Promise<{ data: Team[] }>;
    addDataRetentionCustomPolicyChannels: (id: string, policy: PatchDataRetentionCustomPolicyChannels) => Promise<{ data: ChannelWithTeamData[] }>;
    removeDataRetentionCustomPolicyChannels: (id: string, policy: PatchDataRetentionCustomPolicyChannels) => Promise<{ data: ChannelWithTeamData[] }>;
};

type OwnProps = {
    match: {
        params: {
            policy_id: string;
        };
    };
}

const getSortedListOfTeams = createSelector(
    getTeamsInPolicy,
    (teams) => Object.values(teams).sort((a, b) => a.display_name.localeCompare(b.display_name)),
);

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const policyId = ownProps.match.params.policy_id;
    const policy = getDataRetentionCustomPolicy(state, policyId) || {};
    const teams = getSortedListOfTeams(state);

    return {
        policyId,
        policy,
        teams,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            fetchPolicy: fetchPolicy,
            fetchPolicyTeams: fetchPolicyTeams,
            createDataRetentionCustomPolicy,
            updateDataRetentionCustomPolicy,
            addDataRetentionCustomPolicyTeams,
            removeDataRetentionCustomPolicyTeams,
            addDataRetentionCustomPolicyChannels,
            removeDataRetentionCustomPolicyChannels,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomPolicyForm);
