// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import DayPicker from 'react-day-picker';

import MomentLocaleUtils from 'react-day-picker/moment';

import Suggestion from '../suggestion.jsx';

import 'react-day-picker/lib/style.css';

import 'moment';

import 'moment/locale/de';
import 'moment/locale/en-ca';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/it';
import 'moment/locale/ja';
import 'moment/locale/ko';
import 'moment/locale/nl';
import 'moment/locale/pl';
import 'moment/locale/pt-br';
import 'moment/locale/ro';
import 'moment/locale/ru';
import 'moment/locale/tr';
import 'moment/locale/uk';
import 'moment/locale/zh-cn';
import 'moment/locale/zh-tw';

export default class SearchDateSuggestion extends Suggestion {
    handleDayClick = (day) => {
        const dayString = day.toISOString().split('T')[0];
        this.props.onClick(dayString, this.props.matchedPretext);
    }

    render() {
        let modifiers;
        if (this.props.currentDate) {
            modifiers = {
                today: this.props.currentDate,
            };
        }

        let currentLocale;
        if (this.props.currentLocale) {
            currentLocale = this.props.currentLocale;
        }

        return (
            <DayPicker
                onDayClick={this.handleDayClick}
                showOutsideDays={true}
                modifiers={modifiers}
                localeUtils={MomentLocaleUtils}
                locale={currentLocale}
                ref={(node) => {
                    this.node = node;
                }}
            />
        );
    }
}
