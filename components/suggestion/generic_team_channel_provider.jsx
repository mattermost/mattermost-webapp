// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {autocompleteChannelsByTeamId} from 'actions/channel_actions.jsx';

import {ChannelSuggestion} from './generic_channel_provider.jsx';

import Provider from './provider.jsx';

export default class TeamChannelProvider extends Provider {
    constructor(teamId) {
        super();
        this.teamId = teamId;
    }

    handlePretextChanged(pretext, resultsCallback) {
        const normalizedPretext = pretext.toLowerCase();
        this.startNewRequest(normalizedPretext);

        autocompleteChannelsByTeamId(
            this.teamId,
            normalizedPretext,
            (data) => {
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
        );

        return true;
    }
}
