// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {ActionTypes} from 'utils/constants.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class MenuActionSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'mentions__name';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        return (
            <div
                className={className}
                onClick={this.handleClick}
                {...Suggestion.baseProps}
            >
                {item.text}
            </div>
        );
    }
}

export default class MenuActionProvider extends Provider {
    constructor(options) {
        super();
        this.options = options;
    }

    handlePretextChanged(suggestionId, prefix) {
        if (prefix.length === 0) {
            this.displayAllOptions(suggestionId, prefix);
            return true;
        }

        if (prefix) {
            this.filterOptions(suggestionId, prefix);
            return true;
        }

        return false;
    }

    async displayAllOptions(suggestionId) {
        const terms = this.options.map((option) => option.text);

        setTimeout(() => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                id: suggestionId,
                matchedPretext: '',
                terms,
                items: this.options,
                component: MenuActionSuggestion,
            });
        }, 0);
    }

    async filterOptions(suggestionId, prefix) {
        const filteredOptions = this.options.filter((option) => option.text.toLowerCase().indexOf(prefix) >= 0);
        const terms = filteredOptions.map((option) => option.text);

        setTimeout(() => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                id: suggestionId,
                matchedPretext: prefix,
                terms,
                items: filteredOptions,
                component: MenuActionSuggestion,
            });
        }, 0);
    }
}
