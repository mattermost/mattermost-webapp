// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {getTimezoneRegion} from 'mattermost-redux/utils/timezone_utils';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {ActionTypes} from 'utils/constants.jsx';
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
            >
                {timezone}
            </div>
        );
    }
}

export default class TimezoneProvider extends Provider {
    handlePretextChanged(suggestionId, timezonePrefix) {
        if (timezonePrefix.length === 0) {
            this.displayAllTimezones(suggestionId, timezonePrefix);
            return true;
        }

        if (timezonePrefix) {
            this.filterTimezones(suggestionId, timezonePrefix);
            return true;
        }

        return false;
    }

    async displayAllTimezones(suggestionId) {
        setTimeout(() => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                id: suggestionId,
                matchedPretext: '',
                terms: getSupportedTimezones(),
                items: getSupportedTimezones(),
                component: TimezoneSuggestion,
            });
        }, 0);
    }

    async filterTimezones(suggestionId, timezonePrefix) {
        const filteredTimezones = getSupportedTimezones().filter((t) => (
            getTimezoneRegion(t).toLowerCase().indexOf(timezonePrefix) >= 0 ||
                t.toLowerCase().indexOf(timezonePrefix) >= 0
        ));

        setTimeout(() => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                id: suggestionId,
                matchedPretext: timezonePrefix,
                terms: filteredTimezones,
                items: filteredTimezones,
                component: TimezoneSuggestion,
            });
        }, 0);
    }
}
