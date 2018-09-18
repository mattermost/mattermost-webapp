// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {autocompleteChannelsForSearch} from 'actions/channel_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {sortChannelsByDisplayName} from 'utils/channel_utils.jsx';
import Constants from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

function itemToName(item) {
    if (item.type === Constants.DM_CHANNEL) {
        return '@' + item.display_name;
    }
    if (item.type === Constants.GM_CHANNEL) {
        return '@' + item.display_name.replace(/ /g, '');
    }
    return item.name;
}

class SearchChannelSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'search-autocomplete__item';
        if (isSelection) {
            className += ' selected';
        }

        const name = itemToName(item);

        return (
            <div
                onClick={this.handleClick}
                className={className}
                {...Suggestion.baseProps}
            >
                <i
                    className='fa fa fa-plus-square'
                    title={localizeMessage('generic_icons.select', 'Select Icon')}
                />{name}
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

            autocompleteChannelsForSearch(
                channelPrefix,
                (data) => {
                    if (this.shouldCancelDispatch(channelPrefix)) {
                        return;
                    }
                    const channels = data.sort(sortChannelsByDisplayName);
                    const channelNames = channels.map(itemToName);

                    AppDispatcher.handleServerAction({
                        type: Constants.ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
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
