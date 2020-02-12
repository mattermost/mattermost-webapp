// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {sortChannelsByTypeAndDisplayName} from 'mattermost-redux/utils/channel_utils';

import Constants from 'utils/constants';
import SelectIcon from 'components/widgets/icons/fa_select_icon';
import BotBadge from 'components/widgets/badges/bot_badge';

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
    if (item.type === Constants.OPEN_CHANNEL || item.type === Constants.PRIVATE_CHANNEL) {
        return item.display_name + ' (~' + item.name + ')';
    }
    return item.name;
}

function itemToTerm(item) {
    if (item.type === Constants.DM_CHANNEL) {
        return '@' + item.display_name;
    }
    if (item.type === Constants.GM_CHANNEL) {
        return '@' + item.display_name.replace(/ /g, '');
    }
    if (item.type === Constants.OPEN_CHANNEL || item.type === Constants.PRIVATE_CHANNEL) {
        return item.name;
    }
    return item.name;
}

class SearchChannelSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'search-autocomplete__item';
        if (isSelection) {
            className += ' selected a11y--focused';
        }

        const name = itemToName(item);

        let tag = null;
        if (item.type === Constants.DM_CHANNEL) {
            const teammate = getDirectTeammate(item.id);
            tag = (
                <BotBadge
                    show={Boolean(teammate && teammate.is_bot)}
                    className='badge-popoverlist'
                />
            );
        }

        return (
            <div
                onClick={this.handleClick}
                className={className}
                onMouseMove={this.handleMouseMove}
                ref={(node) => {
                    this.node = node;
                }}
                {...Suggestion.baseProps}
            >
                <SelectIcon/>
                <span
                    data-testid='listItem'
                    className='search-autocomplete__name'
                >
                    {name}
                </span>
                {tag}
            </div>
        );
    }
}

export default class SearchChannelProvider extends Provider {
    constructor(channelSearchFunc) {
        super();
        this.autocompleteChannelsForSearch = channelSearchFunc;
    }

    handlePretextChanged(pretext, resultsCallback) {
        const captured = (/\b(?:in|channel):\s*(\S*)$/i).exec(pretext.toLowerCase());
        if (captured) {
            const channelPrefix = captured[1];

            this.startNewRequest(channelPrefix);

            this.autocompleteChannelsForSearch(
                channelPrefix,
                (data) => {
                    if (this.shouldCancelDispatch(channelPrefix)) {
                        return;
                    }

                    //
                    // MM-12677 When this is migrated this needs to be fixed to pull the user's locale
                    //
                    const channels = data.sort(sortChannelsByTypeAndDisplayName.bind(null, 'en'));
                    const channelNames = channels.map(itemToTerm);

                    resultsCallback({
                        matchedPretext: channelPrefix,
                        terms: channelNames,
                        items: channels,
                        component: SearchChannelSuggestion,
                    });
                },
            );
        }

        return Boolean(captured);
    }
}
