// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {autocompleteChannels} from 'actions/channel_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import SuggestionStore from 'stores/suggestion_store.jsx';

import {ActionTypes, Constants} from 'utils/constants.jsx';
import * as ChannelUtils from 'utils/channel_utils.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class ChannelMentionSuggestion extends Suggestion {
    render() {
        const isSelection = this.props.isSelection;
        const item = this.props.item;

        const channelName = item.channel.display_name;
        const purpose = item.channel.purpose;

        let className = 'mentions__name';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        const description = '(~' + item.channel.name + ')';

        return (
            <div
                className={className}
                onClick={this.handleClick}
            >
                <div className='mention__align'>
                    <span>
                        {channelName}
                    </span>
                    <span className='mention__channelname'>
                        {' '}
                        {description}
                    </span>
                </div>
                <div className='mention__purpose'>
                    {purpose}
                </div>
            </div>
        );
    }
}

export default class ChannelMentionProvider extends Provider {
    constructor() {
        super();

        this.lastPrefixWithNoResults = '';
        this.lastCompletedWord = '';
    }

    handlePretextChanged(suggestionId, pretext) {
        const captured = (/(^|\s)(~([^~\r\n]*))$/i).exec(pretext.toLowerCase());

        if (!captured) {
            // Not a channel mention
            return false;
        }

        const prefix = captured[3];

        if (this.lastPrefixWithNoResults && prefix.startsWith(this.lastPrefixWithNoResults)) {
            // Just give up since we know it won't return any results
            return false;
        }

        if (this.lastCompletedWord && captured[0].startsWith(this.lastCompletedWord)) {
            // It appears we're still matching a channel handle that we already completed
            return false;
        }

        // Clear the last completed word since we've started to match new text
        this.lastCompletedWord = '';

        this.startNewRequest(suggestionId, prefix);

        SuggestionStore.clearSuggestions(suggestionId);

        const words = prefix.toLowerCase().split(/\s+/);
        const wrappedChannelIds = {};
        var wrappedChannels = [];
        ChannelStore.getAll().forEach((item) => {
            if (item.type !== 'O' || item.delete_at > 0) {
                return;
            }
            const nameWords = item.name.toLowerCase().split(/\s+/).concat(item.display_name.toLowerCase().split(/\s+/));
            var matched = true;
            for (var j = 0; matched && j < words.length; j++) {
                if (!words[j]) {
                    continue;
                }
                var wordMatched = false;
                for (var i = 0; i < nameWords.length; i++) {
                    if (nameWords[i].startsWith(words[j])) {
                        wordMatched = true;
                        break;
                    }
                }
                if (!wordMatched) {
                    matched = false;
                    break;
                }
            }
            if (!matched) {
                return;
            }
            wrappedChannelIds[item.id] = true;
            wrappedChannels.push({
                type: Constants.MENTION_CHANNELS,
                channel: item,
            });
        });
        wrappedChannels = wrappedChannels.sort((a, b) => {
            return ChannelUtils.sortChannelsByDisplayName(a.channel, b.channel);
        });
        const channelMentions = wrappedChannels.map((item) => '~' + item.channel.name);
        if (channelMentions.length > 0) {
            SuggestionStore.addSuggestions(suggestionId, channelMentions, wrappedChannels, ChannelMentionSuggestion, captured[2]);
        }

        SuggestionStore.addSuggestions(suggestionId, [''], [{
            type: Constants.MENTION_MORE_CHANNELS,
            loading: true,
        }], ChannelMentionSuggestion, captured[2]);

        autocompleteChannels(
            prefix,
            (channels) => {
                if (this.shouldCancelDispatch(prefix)) {
                    return;
                }

                if (channels.length === 0) {
                    this.lastPrefixWithNoResults = prefix;
                }

                // Wrap channels in an outer object to avoid overwriting the 'type' property.
                const wrappedMoreChannels = [];
                const moreChannels = [];
                channels.forEach((item) => {
                    if (ChannelStore.get(item.id)) {
                        if (!wrappedChannelIds[item.id]) {
                            wrappedChannelIds[item.id] = true;
                            wrappedChannels.push({
                                type: Constants.MENTION_CHANNELS,
                                channel: item,
                            });
                        }
                        return;
                    }

                    wrappedMoreChannels.push({
                        type: Constants.MENTION_MORE_CHANNELS,
                        channel: item,
                    });

                    moreChannels.push(item);
                });

                wrappedChannels = wrappedChannels.sort((a, b) => {
                    return ChannelUtils.sortChannelsByDisplayName(a.channel, b.channel);
                });
                const wrapped = wrappedChannels.concat(wrappedMoreChannels);
                const mentions = wrapped.map((item) => '~' + item.channel.name);

                AppDispatcher.handleServerAction({
                    type: ActionTypes.RECEIVED_MORE_CHANNELS,
                    channels: moreChannels,
                });

                AppDispatcher.handleServerAction({
                    type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                    id: suggestionId,
                    matchedPretext: captured[2],
                    terms: mentions,
                    items: wrapped,
                    component: ChannelMentionSuggestion,
                });
            }
        );

        return true;
    }

    handleCompleteWord(term) {
        this.lastCompletedWord = term;
        this.lastPrefixWithNoResults = '';
    }
}
