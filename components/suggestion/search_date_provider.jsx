// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {autocompleteUsersInTeam} from 'actions/user_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {ActionTypes, Constants} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';
import DayPicker from 'react-day-picker';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

import * as Utils from 'utils/utils.jsx';

import 'react-day-picker/lib/style.css';

class SearchDateSuggestion extends Suggestion {
    constructor(props) {
        super(props);
        this.handleDayClick = this.handleDayClick.bind(this);
    }

    handleDayClick(day, modifiers = {}) {
        const dayString = day.toISOString().split('T')[0];
        this.props.onClick(dayString, this.props.matchedPretext);
    }

    render() {
        const {item, isSelection, onClick, matchedPretext, term} = this.props;

        let className = 'search-autocomplete__item';
        if (isSelection) {
            className += ' selected';
        }

        const pickerProps = term !== "" ? {selectedDays: new Date(term)} : {};

        return (
            <div
                className={className}
            >
                <DayPicker                    
                    onDayClick={this.handleDayClick}
                    showOutsideDays
                    // {...pickerProps}
                />
            </div>
        );
    }
}

export default class SearchDateProvider extends Provider {
    handlePretextChanged(suggestionId, pretext) {
        const captured = (/\b(?:on|before|after):\s*(\S*)$/i).exec(pretext.toLowerCase());
        if (captured) {
            const datePrefix = captured[1];
            const selectedDate = datePrefix? datePrefix : "";
            
            this.startNewRequest(suggestionId, datePrefix);

            const dates = Object.assign([], [{ label:'Selected Date', date:selectedDate }]);
            const terms = dates.map((date) => date.date);

            setTimeout(() => {
                AppDispatcher.handleServerAction({
                    type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                    id: suggestionId,
                    matchedPretext: datePrefix,
                    terms: terms,
                    items: dates,
                    component: SearchDateSuggestion
                });                
            }, 0);
        }

        return Boolean(captured);
    }
}
