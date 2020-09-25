// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {isDirectChannel, isGroupChannel, sortChannelsByTypeListAndDisplayName} from 'mattermost-redux/utils/channel_utils';

import Constants from 'utils/constants';

import Provider from './provider.jsx';
import SearchChannelSuggestion from './search_channel_suggestion';

function itemToTerm(isAtSearch, item) {
    const prefix = isAtSearch ? '' : '@';
    if (item.type === Constants.DM_CHANNEL) {
        return prefix + item.display_name;
    }
    if (item.type === Constants.GM_CHANNEL) {
        return prefix + item.display_name.replace(/ /g, '');
    }
    if (item.type === Constants.OPEN_CHANNEL || item.type === Constants.PRIVATE_CHANNEL) {
        return item.name;
    }
    return item.name;
}

export default class SearchChannelProvider extends Provider {
    constructor(channelSearchFunc) {
        super();
        this.autocompleteChannelsForSearch = channelSearchFunc;
    }

    handlePretextChanged(pretext, resultsCallback) {
        const captured = (/\b(?:in|channel):\s*(\S*)$/i).exec(pretext.toLowerCase());
        if (captured) {
            let channelPrefix = captured[1];
            const isAtSearch = channelPrefix.startsWith('@');
            if (isAtSearch) {
                channelPrefix = channelPrefix.replace(/^@/, '');
            }

            this.startNewRequest(channelPrefix);

            this.autocompleteChannelsForSearch(
                channelPrefix,
                (data) => {
                    if (this.shouldCancelDispatch(channelPrefix)) {
                        return;
                    }

                    let channels = data;
                    if (isAtSearch) {
                        channels = channels.filter((ch) => isDirectChannel(ch) || isGroupChannel(ch));
                    }

                    //
                    // MM-12677 When this is migrated this needs to be fixed to pull the user's locale
                    //
                    channels = channels.sort(sortChannelsByTypeListAndDisplayName.bind(null, 'en', [Constants.OPEN_CHANNEL, Constants.PRIVATE_CHANNEL, Constants.DM_CHANNEL, Constants.GM_CHANNEL]));
                    const channelNames = channels.map(itemToTerm.bind(null, isAtSearch));

                    resultsCallback({
                        matchedPretext: channelPrefix,
                        terms: channelNames,
                        items: channels,
                        component: SearchChannelSuggestion,
                    });
                },
            );
        }

        return Boolean(captured);
    }
}
