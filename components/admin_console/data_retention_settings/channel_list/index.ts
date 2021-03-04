// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {createSelector} from 'reselect';

import {getDataRetentionCustomPolicyChannels} from 'mattermost-redux/actions/admin';
import {searchChannels} from 'mattermost-redux/actions/channels';
import {getChannelsInPolicy} from 'mattermost-redux/selectors/entities/channels';
import {getDataRetentionCustomPolicy} from 'mattermost-redux/selectors/entities/admin';

import {ActionFunc} from 'mattermost-redux/types/actions';

import {Channel} from 'mattermost-redux/types/channels';

import {GlobalState} from 'types/store';

import ChannelList from './channel_list';

type OwnProps = {
    policyId: string;
}

type Actions = {
    // searchChannels: (term: string, opts: TeamSearchOpts) => Promise<{data: TeamsWithCount}>;
    getDataRetentionCustomPolicyChannels: (id: string, page: number, perPage: number) => Promise<{ data: Channel[] }>;
}
const getSortedListOfChannels = createSelector(
    getChannelsInPolicy,
    (channels) => Object.values(channels).sort((a, b) => a.display_name.localeCompare(b.display_name)),
);

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const channels = ownProps.policyId ? getSortedListOfChannels(state) : [];
    const policy = ownProps.policyId? getDataRetentionCustomPolicy(state, ownProps.policyId) || {} : {};
    let totalCount = 0;

    if (policy && policy.channel_count) {
        totalCount = policy.channel_count;
    }
    return {
        channels,
        totalCount,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getDataRetentionCustomPolicyChannels,
            // searchTeams,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelList);
