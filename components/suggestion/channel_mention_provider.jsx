// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {getMyChannels, getChannel, getMyChannelMemberships} from 'mattermost-redux/selectors/entities/channels';

import {sortChannelsByTypeAndDisplayName} from 'mattermost-redux/utils/channel_utils';

import {ChannelTypes} from 'mattermost-redux/action_types';

import {autocompleteChannels} from 'actions/channel_actions.jsx';
import store from 'stores/redux_store.jsx';

import {Constants} from 'utils/constants.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class ChannelMentionSuggestion extends Suggestion {
    render() {
        const isSelection = this.props.isSelection;
        const item = this.props.item;

        const channelName = item.channel.display_name;
        const purpose = item.channel.purpose;

        let className = 'mentions__name no-flex';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        const description = '(~' + item.channel.name + ')';

        return (
            <div
                className={className}
                onClick={this.handleClick}
                {...Suggestion.baseProps}
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

        this.lastPrefixTrimmed = '';
        this.lastPrefixWithNoResults = '';
        this.lastCompletedWord = '';
    }

    handlePretextChanged(pretext, resultCallback) {
        this.resetRequest();

        const captured = (/\B(~([^~\r\n]*))$/i).exec(pretext.toLowerCase());

        if (!captured) {
            // Not a channel mention
            return false;
        }

        if (captured.index > 0 && pretext[captured.index - 1] === '~') {
            // Multiple ~'s in a row so let's return and not show the autocomplete
            return false;
        }

        const prefix = captured[2];

        if (this.lastPrefixTrimmed && prefix.trim() === this.lastPrefixTrimmed) {
            // Don't keep searching if the user keeps typing spaces
            return true;
        }

        this.lastPrefixTrimmed = prefix.trim();

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

        this.startNewRequest(prefix);

        const words = prefix.toLowerCase().split(/\s+/);
        const wrappedChannelIds = {};
        var wrappedChannels = [];
        getMyChannels(store.getState()).forEach((item) => {
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
            //
            // MM-12677 When this is migrated this needs to be fixed to pull the user's locale
            //
            return sortChannelsByTypeAndDisplayName('en', a.channel, b.channel);
        });
        const channelMentions = wrappedChannels.map((item) => '~' + item.channel.name);
        resultCallback({
            terms: channelMentions.concat([' ']),
            items: wrappedChannels.concat([{
                type: Constants.MENTION_MORE_CHANNELS,
                loading: true,
            }]),
            component: ChannelMentionSuggestion,
            matchedPretext: captured[1],
        });

        autocompleteChannels(
            prefix,
            (channels) => {
                const myMembers = getMyChannelMemberships(store.getState());
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
                    if (item.delete_at > 0 && !myMembers[item.id]) {
                        return;
                    }
                    if (getChannel(store.getState(), item.id)) {
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
                    //
                    // MM-12677 When this is migrated this needs to be fixed to pull the user's locale
                    //
                    return sortChannelsByTypeAndDisplayName('en', a.channel, b.channel);
                });
                const wrapped = wrappedChannels.concat(wrappedMoreChannels);
                const mentions = wrapped.map((item) => '~' + item.channel.name);

                store.dispatch({
                    type: ChannelTypes.RECEIVED_CHANNELS,
                    data: moreChannels,
                });

                resultCallback({
                    matchedPretext: captured[1],
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
