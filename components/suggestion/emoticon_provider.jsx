// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {autocompleteCustomEmojis} from 'mattermost-redux/actions/emojis';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getEmojiMap, getRecentEmojis} from 'selectors/emojis';

import store from 'stores/redux_store.jsx';

import * as Emoticons from 'utils/emoticons.jsx';
import {compareEmojis} from 'utils/emoji_utils.jsx';

import Suggestion from './suggestion.jsx';
import Provider from './provider.jsx';

export const MIN_EMOTICON_LENGTH = 2;
export const EMOJI_CATEGORY_SUGGESTION_BLACKLIST = ['skintone'];

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
                {...Suggestion.baseProps}
            >
                <div className='pull-left'>
                    <img
                        alt={text}
                        className='emoticon-suggestion__image'
                        src={getEmojiImageUrl(emoji)}
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

export default class EmoticonProvider extends Provider {
    handlePretextChanged(pretext, resultsCallback) {
        // Look for the potential emoticons at the start of the text, after whitespace, and at the start of emoji reaction commands
        const captured = (/(^|\s|^\+|^-)(:([^:\s]*))$/g).exec(pretext);
        if (!captured) {
            return false;
        }

        const prefix = captured[1];
        const text = captured[2];
        const partialName = captured[3];

        if (partialName.length < MIN_EMOTICON_LENGTH) {
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
            store.dispatch(autocompleteCustomEmojis(partialName)).then(() => this.findAndSuggestEmojis(text, partialName, resultsCallback));
        } else {
            this.findAndSuggestEmojis(text, partialName, resultsCallback);
        }

        return true;
    }

    formatEmojis(emojis) {
        return emojis.map((item) => ':' + item.name + ':');
    }

    findAndSuggestEmojis(text, partialName, resultsCallback) {
        const recentMatched = [];
        const matched = [];

        const emojiMap = getEmojiMap(store.getState());
        const recentEmojis = getRecentEmojis(store.getState());

        // Check for named emoji
        for (const [name, emoji] of emojiMap) {
            if (EMOJI_CATEGORY_SUGGESTION_BLACKLIST.includes(emoji.category)) {
                continue;
            }

            if (emoji.aliases) {
                // This is a system emoji so it may have multiple names
                for (const alias of emoji.aliases) {
                    if (alias.indexOf(partialName) !== -1) {
                        const matchedArray = recentEmojis.includes(alias) || recentEmojis.includes(name) ?
                            recentMatched :
                            matched;

                        matchedArray.push({name: alias, emoji});
                        break;
                    }
                }
            } else if (name.indexOf(partialName) !== -1) {
                // This is a custom emoji so it only has one name
                if (emojiMap.hasSystemEmoji(name)) {
                    // System emojis take precedence over custom ones
                    continue;
                }

                const matchedArray = recentEmojis.includes(name) ?
                    recentMatched :
                    matched;

                matchedArray.push({name, emoji});
            }
        }

        const sortEmojisHelper = (a, b) => {
            return compareEmojis(a, b, partialName);
        };

        recentMatched.sort(sortEmojisHelper);

        matched.sort(sortEmojisHelper);

        const terms = [
            ...this.formatEmojis(recentMatched),
            ...this.formatEmojis(matched),
        ];

        const items = [
            ...recentMatched,
            ...matched,
        ];

        // Required to get past the dispatch during dispatch error

        resultsCallback({
            matchedPretext: text,
            terms,
            items,
            component: EmoticonSuggestion,
        });
    }
}
