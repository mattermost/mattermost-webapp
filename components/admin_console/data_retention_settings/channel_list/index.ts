// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getDataRetentionCustomPolicyChannels, searchDataRetentionCustomPolicyChannels} from 'mattermost-redux/actions/admin';
import {getChannelsInPolicy, searchChannelsInPolicy} from 'mattermost-redux/selectors/entities/channels';
import {getDataRetentionCustomPolicy} from 'mattermost-redux/selectors/entities/admin';
import {filterChannelsMatchingTerm, channelListToMap} from 'mattermost-redux/utils/channel_utils';

import {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions';

import {Channel, ChannelSearchOpts} from 'mattermost-redux/types/channels';

import {GlobalState} from 'types/store';

import {setChannelListSearch, setChannelListFilters} from 'actions/views/search';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {DataRetentionCustomPolicy} from 'mattermost-redux/types/data_retention';

import ChannelList from './channel_list';

type OwnProps = {
    policyId?: string;
    channelsToAdd: Dictionary<Channel>;
}

type Actions = {
    searchDataRetentionCustomPolicyChannels: (id: string, term: string, opts: ChannelSearchOpts) => Promise<{ data: Channel[] }>;
    getDataRetentionCustomPolicyChannels: (id: string, page: number, perPage: number) => Promise<{ data: Channel[] }>;
    setChannelListSearch: (term: string) => ActionResult;
    setChannelListFilters: (filters: ChannelSearchOpts) => ActionResult;
}

function searchChannelsToAdd(channels: Dictionary<Channel>, term: string): Dictionary<Channel> {
    const filteredTeams = filterChannelsMatchingTerm(Object.keys(channels).map((key) => channels[key]), term);
    return channelListToMap(filteredTeams);
}

function mapStateToProps() {
    const getPolicyChannels = getChannelsInPolicy();
    return (state: GlobalState, ownProps: OwnProps) => {
        let {channelsToAdd} = ownProps;

        let channels: Channel[] = [];
        let totalCount = 0;
        const policyId = ownProps.policyId;
        const policy = policyId ? getDataRetentionCustomPolicy(state, policyId) || {} as DataRetentionCustomPolicy : {} as DataRetentionCustomPolicy;
        const searchTerm = state.views.search.channelListSearch.term || '';
        const filters = state.views.search.channelListSearch?.filters || {};

        if (searchTerm) {
            channels = policyId ? searchChannelsInPolicy(state, policyId, searchTerm, filters) : [];
            channelsToAdd = searchChannelsToAdd(channelsToAdd, searchTerm);
            totalCount = channels.length;
        } else {
            channels = policyId ? getPolicyChannels(state, {policyId}) : [];
            if (policy && policy.channel_count) {
                totalCount = policy.channel_count;
            }
        }
        return {
            channels,
            totalCount,
            searchTerm,
            channelsToAdd,
            filters,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            getDataRetentionCustomPolicyChannels,
            searchChannels: searchDataRetentionCustomPolicyChannels,
            setChannelListSearch,
            setChannelListFilters,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelList);
