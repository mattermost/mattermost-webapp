// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {autocompleteChannels} from 'actions/channel_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import {sortChannelsByDisplayName} from 'utils/channel_utils.jsx';
import {ActionTypes, Constants} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class SearchChannelSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'search-autocomplete__item';
        if (isSelection) {
            className += ' selected';
        }

        return (
            <div
                onClick={this.handleClick}
                className={className}
                {...Suggestion.baseProps}
            >
                <i
                    className='fa fa fa-plus-square'
                    title={localizeMessage('generic_icons.select', 'Select Icon')}
                />{item.name}
            </div>
        );
    }
}

export default class SearchChannelProvider extends Provider {
    handlePretextChanged(suggestionId, pretext) {
        const captured = (/\b(?:in|channel):\s*(\S*)$/i).exec(pretext.toLowerCase());
        if (captured) {
            const channelPrefix = captured[1];

            this.startNewRequest(suggestionId, channelPrefix);

            autocompleteChannels(
                channelPrefix,
                (data) => {
                    if (this.shouldCancelDispatch(channelPrefix)) {
                        return;
                    }

                    const publicChannels = data;

                    const localChannels = ChannelStore.getAll();
                    let privateChannels = [];

                    for (const id of Object.keys(localChannels)) {
                        const channel = localChannels[id];
                        if (channel.name.startsWith(channelPrefix) && channel.type === Constants.PRIVATE_CHANNEL) {
                            privateChannels.push(channel);
                        }
                    }

                    let filteredPublicChannels = [];
                    publicChannels.forEach((item) => {
                        if (item.name.startsWith(channelPrefix)) {
                            filteredPublicChannels.push(item);
                        }
                    });

                    privateChannels = privateChannels.sort(sortChannelsByDisplayName);
                    filteredPublicChannels = filteredPublicChannels.sort(sortChannelsByDisplayName);

                    const channels = filteredPublicChannels.concat(privateChannels);
                    const channelNames = channels.map((channel) => channel.name);

                    AppDispatcher.handleServerAction({
                        type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                        id: suggestionId,
                        matchedPretext: channelPrefix,
                        terms: channelNames,
                        items: channels,
                        component: SearchChannelSuggestion,
                    });
                }
            );
        }

        return Boolean(captured);
    }
}
