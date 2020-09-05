// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Client4} from 'mattermost-redux/client';

import * as Utils from 'utils/utils.jsx';

import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import Avatar from 'components/widgets/users/avatar';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class AutocompleteSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'suggestion-list__item mentions__name';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        return (
            <div
                className={className}
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                {...Suggestion.baseProps}
            >
                {item.text}
            </div>
        );
    }
}

export default class AutocompleteProvider extends Provider {
    constructor(fetchOptionsFunc, fetchOnce) {
        super();
        this.fetchOptions = fetchOptionsFunc;
        this.fetchOnce = fetchOnce;
        this.fetched;
        this.items = [];
    }

    async handlePretextChanged(pretext, resultsCallback) {
        const normalizedPretext = pretext.toLowerCase();

        if (this.fetchOnce && this.fetched) {
            const items = this.items;
            resultsCallback({
                matchedPretext: normalizedPretext,
                terms: items.map((item) => item.text),
                items,
                component: AutocompleteSuggestion,
            });
            return true;
        }
        this.fetched = true;

        this.startNewRequest(normalizedPretext);
        if (this.shouldCancelDispatch(normalizedPretext)) {
            return false;
        }

        this.fetchOptions(normalizedPretext, (data) => {
            const items = Object.assign([], data.items || data);
            this.items = items;

            resultsCallback({
                matchedPretext: normalizedPretext,
                terms: items.map((item) => item.text),
                items,
                component: AutocompleteSuggestion,
            });
        });

        return true;
    }
}
