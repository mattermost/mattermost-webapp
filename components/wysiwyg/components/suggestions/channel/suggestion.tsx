// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// See LICENSE.txt for license information.
import React from 'react';
import {Client4} from 'mattermost-redux/client';
import {SuggestionOptions} from '@tiptap/suggestion';
import {PluginKey} from 'prosemirror-state';

import {WysiwygPluginNames} from 'utils/constants';

import {SuggestionItem} from '../suggestion-list';
import {render} from '../suggestion-base';

import {ChannelSuggestionItem} from './components';

const SuggestionPluginKey = new PluginKey(WysiwygPluginNames.CHANNEL_SUGGESTION);

type ChannelSuggestionOptions = {
    teamId: string;
}

export const makeChannelSuggestion: (options: ChannelSuggestionOptions) => Omit<SuggestionOptions<SuggestionItem>, 'editor'> = ({teamId}) => ({
    char: '~',

    pluginKey: SuggestionPluginKey,

    items: async ({query}: {query: string}) => {
        const channels = await Client4.autocompleteChannels(teamId, query);
        const results: SuggestionItem[] = [];

        // parse channel data and push it into the results array
        if (Array.isArray(channels) && channels.length > 0) {
            results.push(...channels.map((channel) => ({
                id: channel.id,
                type: 'channels',
                label: channel.name,
                content: <ChannelSuggestionItem {...channel}/>,
            })));
        }

        return results;
    },

    render,
});
