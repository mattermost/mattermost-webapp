// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {getTimezoneRegion} from 'mattermost-redux/utils/timezone_utils';

import {getSupportedTimezones} from 'utils/timezone';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class TimezoneSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;
        const timezone = item;

        let className = 'mentions__name';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        return (
            <div
                onClick={this.handleClick}
                className={className}
                ref={(node) => {
                    this.node = node;
                }}
                {...Suggestion.baseProps}
            >
                {timezone}
            </div>
        );
    }
}

export default class TimezoneProvider extends Provider {
    handlePretextChanged(timezonePrefix, resultsCallback) {
        if (timezonePrefix.length === 0) {
            this.displayAllTimezones(resultsCallback, timezonePrefix);
            return true;
        }

        if (timezonePrefix) {
            this.filterTimezones(resultsCallback, timezonePrefix);
            return true;
        }

        return false;
    }

    async displayAllTimezones(resultsCallback) {
        resultsCallback({
            matchedPretext: '',
            terms: getSupportedTimezones(),
            items: getSupportedTimezones(),
            component: TimezoneSuggestion,
        });
    }

    async filterTimezones(resultsCallback, timezonePrefix) {
        const filteredTimezones = getSupportedTimezones().filter((t) => (
            getTimezoneRegion(t).toLowerCase().indexOf(timezonePrefix) >= 0 ||
                t.toLowerCase().indexOf(timezonePrefix) >= 0
        ));

        resultsCallback({
            matchedPretext: timezonePrefix,
            terms: filteredTimezones,
            items: filteredTimezones,
            component: TimezoneSuggestion,
        });
    }
}
