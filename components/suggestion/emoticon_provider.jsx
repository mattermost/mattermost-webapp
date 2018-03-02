// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {autocompleteCustomEmojis} from 'mattermost-redux/actions/emojis';

import {getEmojiMap} from 'selectors/emojis';

import EmojiStore from 'stores/emoji_store.jsx';
import store from 'stores/redux_store.jsx';
import SuggestionStore from 'stores/suggestion_store.jsx';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import * as Emoticons from 'utils/emoticons.jsx';
import {ActionTypes} from 'utils/constants.jsx';

import Suggestion from './suggestion.jsx';

const MIN_EMOTICON_LENGTH = 2;
const EMOJI_CATEGORY_SUGGESTION_BLACKLIST = ['skintone'];

class EmoticonSuggestion extends Suggestion {
    render() {
        const text = this.props.term;
        const emoji = this.props.item.emoji;

        let className = 'emoticon-suggestion';
        if (this.props.isSelection) {
            className += ' suggestion--selected';
        }

        return (
            <div
                className={className}
                onClick={this.handleClick}
            >
                <div className='pull-left'>
                    <img
                        alt={text}
                        className='emoticon-suggestion__image'
                        src={EmojiStore.getEmojiImageUrl(emoji)}
                        title={text}
                    />
                </div>
                <div className='pull-left'>
                    {text}
                </div>
            </div>
        );
    }
}

export default class EmoticonProvider {
    handlePretextChanged(suggestionId, pretext) {
        // Look for the potential emoticons at the start of the text, after whitespace, and at the start of emoji reaction commands
        const captured = (/(^|\s|^\+|^-)(:([^:\s]*))$/g).exec(pretext);
        if (!captured) {
            return false;
        }

        const prefix = captured[1];
        const text = captured[2];
        const partialName = captured[3];

        if (partialName.length < MIN_EMOTICON_LENGTH) {
            SuggestionStore.clearSuggestions(suggestionId);
            return false;
        }

        // Check for text emoticons if this isn't for an emoji reaction
        if (prefix !== '-' && prefix !== '+') {
            for (const emoticon of Object.keys(Emoticons.emoticonPatterns)) {
                if (Emoticons.emoticonPatterns[emoticon].test(text)) {
                    // Don't show the autocomplete for text emoticons
                    return false;
                }
            }
        }

        if (store.getState().entities.general.config.EnableCustomEmoji === 'true') {
            autocompleteCustomEmojis(partialName)(store.dispatch, store.getState).then(() => this.findAndSuggestEmojis(suggestionId, text, partialName));
        }

        this.findAndSuggestEmojis(suggestionId, text, partialName);

        return true;
    }

    findAndSuggestEmojis(suggestionId, text, partialName) {
        const matched = [];

        const emojiMap = getEmojiMap(store.getState());

        // Check for named emoji
        for (const [name, emoji] of emojiMap) {
            if (emoji.aliases) {
                // This is a system emoji so it may have multiple names
                for (const alias of emoji.aliases) {
                    if (!EMOJI_CATEGORY_SUGGESTION_BLACKLIST.includes(emoji.category) && alias.indexOf(partialName) !== -1) {
                        matched.push({name: alias, emoji});
                        break;
                    }
                }
            } else if (name.indexOf(partialName) !== -1) {
                // This is a custom emoji so it only has one name
                if (EmojiStore.hasSystemEmoji(name)) {
                    // System emojis take precedence over custom ones
                    continue;
                }

                matched.push({name, emoji});
            }
        }

        // Sort the emoticons so that emoticons starting with the entered text come first
        matched.sort((a, b) => {
            const aName = a.name;
            const bName = b.name;

            const aPrefix = aName.startsWith(partialName);
            const bPrefix = bName.startsWith(partialName);

            if (aPrefix === bPrefix) {
                return aName.localeCompare(bName);
            } else if (aPrefix) {
                return -1;
            }

            return 1;
        });

        const terms = matched.map((item) => ':' + item.name + ':');

        // Required to get past the dispatch during dispatch error
        setTimeout(() => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                id: suggestionId,
                matchedPretext: text,
                terms,
                items: matched,
                component: EmoticonSuggestion,
            });
        }, 0);
    }
}
