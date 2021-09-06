// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Provider, {ResultCallbackParams} from './provider';
import Suggestion, {SuggestionProps} from './suggestion';

class MenuActionSuggestion extends Suggestion<SuggestionProps> {
    render(): React.ReactNode {
        const {item, isSelection} = this.props;

        let className = 'suggestion-list__item';
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
type Option = {value: string; text: string};
export default class MenuActionProvider extends Provider {
    options: Option[];

    constructor(options: Option[]) {
        super();
        this.options = options;
    }

    handlePretextChanged(prefix: string, resultsCallback: (params: ResultCallbackParams) => void): boolean {
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

    displayAllOptions(resultsCallback: (params: ResultCallbackParams) => void): void {
        const terms = this.options.map((option) => option.text);

        resultsCallback({
            matchedPretext: '',
            terms,
            items: this.options,
            component: MenuActionSuggestion,
        });
    }

    filterOptions(prefix: string, resultsCallback: (params: ResultCallbackParams) => void): void {
        const filteredOptions = this.options.filter((option) => option.text.toLowerCase().indexOf(prefix.toLowerCase()) >= 0);
        const terms = filteredOptions.map((option) => option.text);

        resultsCallback({
            matchedPretext: prefix,
            terms,
            items: filteredOptions,
            component: MenuActionSuggestion,
        });
    }
}
