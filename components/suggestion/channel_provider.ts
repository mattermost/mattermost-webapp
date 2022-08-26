// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Channel} from '@mattermost/types/channels';
import {getChannelsInAllTeams, getDirectAndGroupChannels} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {makeSearchProfilesMatchingWithTerm} from 'mattermost-redux/selectors/entities/users';
import store from 'stores/redux_store.jsx';

export type ProviderResult = Channel;

export type TChannelProvider = {
    handleSearch: (term: string) => Promise<ProviderResult[]>;
    lastResults: ProviderResult[];
}

function channelProvider(): TChannelProvider {
    const state = store.getState();
    const config = getConfig(state);
    const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';
    const searchProfilesMatchingWithTerm = makeSearchProfilesMatchingWithTerm();

    let lastResults: ProviderResult[] = [];

    function handleSearch(term: string) {
        return new Promise<ProviderResult[]>((resolve) => {
            const results: Channel[] = [];

            const channels = getChannelsInAllTeams(state).concat(getDirectAndGroupChannels(state));
            const users = Object.assign([], searchProfilesMatchingWithTerm(state, term, false));
            results.concat(channels, users);

            console.log('####### channels', channels);
            console.log('####### users', users);
            console.log('####### results', results);

            lastResults = results;
            resolve(results);
        });
    }

    return {
        handleSearch,
        lastResults,
    };
}

store.subscribe(channelProvider);

export default channelProvider;
