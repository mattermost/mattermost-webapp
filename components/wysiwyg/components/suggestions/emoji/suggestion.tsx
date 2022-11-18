// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {autocompleteCustomEmojis} from 'mattermost-redux/actions/emojis';
import {PluginKey} from 'prosemirror-state';
import {SuggestionOptions} from '@tiptap/suggestion';

import store from 'stores/redux_store.jsx';
import {getEmojiMap, getRecentEmojisNames} from 'selectors/emojis';

import {WysiwygPluginNames} from 'utils/constants';
import {compareEmojis, emojiMatchesSkin} from 'utils/emoji_utils';
import EmojiMap from 'utils/emoji_map';

import {Emoji} from '@mattermost/types/emojis';

import {SuggestionItem} from '../suggestion-list';
import {render} from '../suggestion-base';

import {EmojiSuggestionItem} from './components';

const SuggestionPluginKey = new PluginKey(WysiwygPluginNames.EMOJI_SUGGESTION);

export const MIN_EMOTICON_LENGTH = 2;
export const EMOJI_CATEGORY_SUGGESTION_BLOCKLIST = ['skintone'];

type ChannelSuggestionOptions = {
    useCustomEmojis: boolean;
}

// findAndSuggestEmojis uses the provided partialName to match anywhere inside an emoji name.
//
// For example, typing `:welc` would match both `:welcome:` and `:youre_welcome:` if those
// emojis are present in the local store. Note, however, that the server only does prefix
// matches, so a query to populate the local store for `:welc` would only return `:welcome:`.
// This results in surprising differences between a fresh load of the application, and the
// changes to the cache from expanding the cache with emojis found in existing posts.
//
// For now, this behaviour and difference is by design.
// See https://mattermost.atlassian.net/browse/MM-17320.
function findAndSuggestEmojis(partialName: string): SuggestionItem[] {
    const recentMatched: Array<{ name: string; emoji: Emoji }> = [];
    const matched: Array<{ name: string; emoji: Emoji }> = [];
    const state = store.getState();
    const skintone = state.entities?.preferences?.myPreferences['emoji--emoji_skintone']?.value || 'default';
    const emojiMap: EmojiMap = getEmojiMap(state);
    const recentEmojis = getRecentEmojisNames(state);

    // Disable this rule since `emojiMap` does apparently not have an Iterator (but it actually does)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    for (const [name, emoji] of emojiMap) {
        if (EMOJI_CATEGORY_SUGGESTION_BLOCKLIST.includes(emoji.category)) {
            continue;
        }

        if (emoji.short_names) {
            // This is a system emoji so it may have multiple names
            for (const alias of emoji.short_names) {
                if (alias.indexOf(partialName) !== -1) {
                    const matchedArray = recentEmojis.includes(alias) || recentEmojis.includes(name) ? recentMatched : matched;

                    // if the emoji has skin, only add those that match with the user selected skin.
                    if (emojiMatchesSkin(emoji, skintone)) {
                        matchedArray.push({name: alias, emoji});
                    }
                    break;
                }
            }
        } else if (name.indexOf(partialName) !== -1) {
            // This is a custom emoji so it only has one name
            if (emojiMap.hasSystemEmoji(name)) {
                // System emojis take precedence over custom ones
                continue;
            }

            const matchedArray = recentEmojis.includes(name) ? recentMatched : matched;

            matchedArray.push({name, emoji});
        }
    }

    const sortEmojisHelper = (a: { name: string; emoji: Emoji }, b: { name: string; emoji: Emoji }) => {
        return compareEmojis(a.emoji, b.emoji, partialName);
    };

    recentMatched.sort(sortEmojisHelper);
    matched.sort(sortEmojisHelper);

    return recentMatched.concat(matched).map((match) => ({
        id: match.name,
        type: 'emoji',
        label: match.name,
        content: <EmojiSuggestionItem name={match.name}/>,
    }));
}

export const makeEmojiSuggestion: (options: ChannelSuggestionOptions) => Omit<SuggestionOptions<SuggestionItem>, 'editor'> = () => ({
    char: ':',

    pluginKey: SuggestionPluginKey,

    items: ({query}: {query: string}) => {
        return new Promise((resolve) => {
            if (query.length < MIN_EMOTICON_LENGTH) {
                resolve([]);
                return;
            }

            if (store.getState().entities.general.config.EnableCustomEmoji === 'true') {
                store.dispatch(autocompleteCustomEmojis(query)).then(() => resolve(findAndSuggestEmojis(query)));
            } else {
                resolve(findAndSuggestEmojis(query));
            }
        });
    },

    render,
});
