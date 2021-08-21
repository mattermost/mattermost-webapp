// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {autocompleteCustomEmojis} from 'mattermost-redux/actions/emojis';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getEmojiMap, getRecentEmojis} from 'selectors/emojis';

import store from 'stores/redux_store.jsx';

import * as Emoticons from 'utils/emoticons';
import {compareEmojis} from 'utils/emoji_utils';

import {Emoji} from 'mattermost-redux/types/emojis';

import EmojiMap from '../../utils/emoji_map';

import Suggestion, {SuggestionProps} from './suggestion';
import Provider, {ResultCallbackParams} from './provider';

export const MIN_EMOTICON_LENGTH = 2;
export const EMOJI_CATEGORY_SUGGESTION_BLOCKLIST = ['skintone'];

type SuggestEmoji = {name: string; emoji: Emoji};

class EmoticonSuggestion extends Suggestion<SuggestionProps> {
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
                onMouseMove={this.handleMouseMove}
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
    triggerCharacter: string;

    constructor() {
        super();

        this.triggerCharacter = ':';
    }

    handlePretextChanged(pretext: string, resultsCallback: (params: ResultCallbackParams) => void): boolean {
        // Look for the potential emoticons at the start of the text, after whitespace, and at the start of emoji reaction commands
        const captured = (/(^|\s|^\+|^-)(:([^:\s]*))$/g).exec(pretext.toLowerCase());
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

    formatEmojis(emojis: SuggestEmoji[]): string[] {
        return emojis.map((item) => ':' + item.name + ':');
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
    findAndSuggestEmojis(text: string, partialName: string, resultsCallback: (params: ResultCallbackParams) => void): void {
        const recentMatched: SuggestEmoji[] = [];
        const matched: SuggestEmoji[] = [];
        const state = store.getState();
        const skintone: string = state.entities?.preferences?.myPreferences['emoji--emoji_skintone']?.value || 'default';
        const emojiMap: EmojiMap = getEmojiMap(state);
        const recentEmojis = getRecentEmojis(state);

        // Check for named emoji
        // @ts-expect-error: Is this possible to fix without porting EmojiMap to Typescript?
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
                        if (Emoticons.emojiMatchesSkin(emoji, skintone)) {
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

        const sortEmojisHelper = (a: SuggestEmoji, b: SuggestEmoji) => {
            return compareEmojis(a.emoji, b.emoji, partialName);
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
