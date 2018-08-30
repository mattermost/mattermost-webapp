// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import DayPicker from 'react-day-picker';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {ActionTypes} from 'utils/constants.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

import 'react-day-picker/lib/style.css';

class SearchDateSuggestion extends Suggestion {
    constructor(props) {
        super(props);
        this.handleDayClick = this.handleDayClick.bind(this);
    }

    handleDayClick(day) {
        const dayString = day.toISOString().split('T')[0];
        this.props.onClick(dayString, this.props.matchedPretext);
    }

    render() {
        return (
            <DayPicker
                onDayClick={this.handleDayClick}
                showOutsideDays={true}
            />
        );
    }
}

export default class SearchDateProvider extends Provider {
    handlePretextChanged(suggestionId, pretext) {
        const captured = (/\b(?:on|before|after):\s*(\S*)$/i).exec(pretext.toLowerCase());
        if (captured) {
            const datePrefix = captured[1];

            this.startNewRequest(suggestionId, datePrefix);

            const dates = Object.assign([], [{label: 'Selected Date', date: datePrefix}]);
            const terms = dates.map((date) => date.date);

            setTimeout(() => {
                AppDispatcher.handleServerAction({
                    type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                    id: suggestionId,
                    matchedPretext: datePrefix,
                    terms,
                    items: dates,
                    component: SearchDateSuggestion,
                });
            }, 0);
        }

        return Boolean(captured);
    }
}
