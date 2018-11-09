// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

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

    handlePretextChanged(prefix, resultsCallback) {
        if (prefix.length === 0) {
            this.displayAllOptions(resultsCallback);
            return true;
        }

        if (prefix) {
            this.filterOptions(prefix, resultsCallback);
            return true;
        }

        return false;
    }

    async displayAllOptions(resultsCallback) {
        const terms = this.options.map((option) => option.text);

        resultsCallback({
            matchedPretext: '',
            terms,
            items: this.options,
            component: MenuActionSuggestion,
        });
    }

    async filterOptions(prefix, resultsCallback) {
        const filteredOptions = this.options.filter((option) => option.text.toLowerCase().indexOf(prefix) >= 0);
        const terms = filteredOptions.map((option) => option.text);

        resultsCallback({
            matchedPretext: prefix,
            terms,
            items: filteredOptions,
            component: MenuActionSuggestion,
        });
    }
}
