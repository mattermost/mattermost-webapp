// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {autocompleteChannels} from 'mattermost-redux/actions/channels';

import store from 'stores/redux_store.jsx';

import {ChannelSuggestion} from './generic_channel_provider.jsx';

import Provider from './provider.jsx';

export default class TeamChannelProvider extends Provider {
    constructor(teamId) {
        super();
        this.teamId = teamId;
    }

    async handlePretextChanged(pretext, resultsCallback) {
        const normalizedPretext = pretext.toLowerCase();
        this.startNewRequest(normalizedPretext);

        const {data, err} = await autocompleteChannels(
            this.teamId,
            normalizedPretext
        )(store.dispatch, store.dispatch);

        if (!err) {
            if (this.shouldCancelDispatch(normalizedPretext)) {
                return;
            }

            const channels = Object.assign([], data);

            resultsCallback({
                matchedPretext: normalizedPretext,
                terms: channels.map((channel) => channel.display_name),
                items: channels,
                component: ChannelSuggestion,
            });
        }
    }
}
