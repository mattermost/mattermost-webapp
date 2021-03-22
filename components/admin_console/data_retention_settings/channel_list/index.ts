// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {createSelector} from 'reselect';

import {getDataRetentionCustomPolicyChannels, clearDataRetentionCustomPolicyChannels, searchDataRetentionCustomPolicyChannels} from 'mattermost-redux/actions/admin';
import {searchChannels} from 'mattermost-redux/actions/channels';
import {getChannelsInPolicy, searchChannelsInPolicy} from 'mattermost-redux/selectors/entities/channels';
import {getDataRetentionCustomPolicy} from 'mattermost-redux/selectors/entities/admin';
import {filterChannelsMatchingTerm, channelListToMap} from 'mattermost-redux/utils/channel_utils';

import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';

import {Channel, ChannelSearchOpts} from 'mattermost-redux/types/channels';

import {GlobalState} from 'types/store';

import ChannelList from './channel_list';
import {setChannelListSearch, setChannelListFilters} from 'actions/views/search';
import { Dictionary } from 'mattermost-redux/types/utilities';

type OwnProps = {
    policyId: string;
    channelsToAdd: Dictionary<Channel>;
}

type Actions = {
    searchDataRetentionCustomPolicyChannels: (id: string, term: string, opts: ChannelSearchOpts) => Promise<{ data: Channel[] }>;
    getDataRetentionCustomPolicyChannels: (id: string, page: number, perPage: number) => Promise<{ data: Channel[] }>;
    clearDataRetentionCustomPolicyChannels: () => {data: {}};
    setChannelListSearch: (term: string) => ActionResult;
    setChannelListFilters: (filters: ChannelSearchOpts) => ActionResult;
}
const getSortedListOfChannels = createSelector(
    getChannelsInPolicy,
    (channels) => Object.values(channels).sort((a, b) => a.display_name.localeCompare(b.display_name)),
);

function searchChannelsToAdd(channels: Dictionary<Channel>, term: string): Dictionary<Channel> {
    const filteredTeams = filterChannelsMatchingTerm(Object.keys(channels).map((key) => channels[key]), term);
    return channelListToMap(filteredTeams);
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    let {channelsToAdd} = ownProps;

    const policy = ownProps.policyId? getDataRetentionCustomPolicy(state, ownProps.policyId) || {} : {};
    let channels: Channel[] = [];
    let totalCount = 0;
    const searchTerm = state.views.search.channelListSearch.term || '';
    const filters = state.views.search.channelListSearch?.filters || {};

    if (searchTerm) {
        channels = searchChannelsInPolicy(state, searchTerm, filters) || [];
        channelsToAdd = searchChannelsToAdd(channelsToAdd, searchTerm);
        totalCount = channels.length;
    } else {
        channels = ownProps.policyId ? getSortedListOfChannels(state) : [];
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
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getDataRetentionCustomPolicyChannels,
            clearDataRetentionCustomPolicyChannels,
            searchChannels: searchDataRetentionCustomPolicyChannels,
            setChannelListSearch,
            setChannelListFilters,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelList);
