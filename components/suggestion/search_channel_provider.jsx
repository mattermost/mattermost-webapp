// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {sortChannelsByTypeAndDisplayName} from 'mattermost-redux/utils/channel_utils';

import {FormattedMessage} from 'react-intl';

import {autocompleteChannelsForSearch} from 'actions/channel_actions.jsx';
import Constants from 'utils/constants.jsx';
import SelectIcon from 'components/icon/select_icon';

import {getDirectTeammate} from 'utils/utils.jsx';

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

        let tag = null;
        if (item.type === Constants.DM_CHANNEL) {
            const teammate = getDirectTeammate(item.id);
            if (teammate && teammate.is_bot) {
                tag = (
                    <div className='bot-indicator bot-indicator__popoverlist'>
                        <FormattedMessage
                            id='post_info.bot'
                            defaultMessage='BOT'
                        />
                    </div>
                );
            }
        }

        return (
            <div
                onClick={this.handleClick}
                className={className}
                {...Suggestion.baseProps}
            >
                <SelectIcon/>
                {name}
                {tag}
            </div>
        );
    }
}

export default class SearchChannelProvider extends Provider {
    handlePretextChanged(pretext, resultsCallback) {
        const captured = (/\b(?:in|channel):\s*(\S*)$/i).exec(pretext.toLowerCase());
        if (captured) {
            const channelPrefix = captured[1];

            this.startNewRequest(channelPrefix);

            autocompleteChannelsForSearch(
                channelPrefix,
                (data) => {
                    if (this.shouldCancelDispatch(channelPrefix)) {
                        return;
                    }

                    //
                    // MM-12677 When this is migrated this needs to be fixed to pull the user's locale
                    //
                    const channels = data.sort(sortChannelsByTypeAndDisplayName.bind(null, 'en'));
                    const channelNames = channels.map(itemToName);

                    resultsCallback({
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
