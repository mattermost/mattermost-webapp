// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import DayPicker from 'react-day-picker';

import MomentLocaleUtils from 'react-day-picker/moment';

import Suggestion from '../suggestion.jsx';

import 'react-day-picker/lib/style.css';

import 'moment';

const loadedLocales: Record<string, moment.Locale> = {};

type Props = {
    locale: string;
}

export default class SearchDateSuggestion extends Suggestion {
    handleDayClick = (day: Date) => {
        const dayString = day.toISOString().split('T')[0];
        this.props.onClick(dayString, this.props.matchedPretext);
    }

    componentDidMount() {
        //the naming scheme of momentjs packages are all lowercases
        const locale = this.props.locale.toLowerCase();

        // Momentjs use en as defualt, no need to import en
        if (locale && locale !== 'en' && !loadedLocales[locale]) {
            /* eslint-disable global-require */
            loadedLocales[locale] = require(`moment/locale/${locale}`);
            /* eslint-disable global-require */
        }
    }

    componentDidUpdate(prevProps: Props) {
        const locale = this.props.locale.toLowerCase();

        if (locale && locale !== 'en' && locale !== prevProps.locale && !loadedLocales[locale]) {
            /* eslint-disable global-require */
            loadedLocales[locale] = require(`moment/locale/${locale}`);
            /* eslint-disable global-require */
        }
    }

    render() {
        let modifiers;
        if (this.props.currentDate) {
            modifiers = {
                today: this.props.currentDate,
            };
        }

        const locale = this.props.locale.toLowerCase();

        return (
            <DayPicker
                onDayClick={this.handleDayClick}
                showOutsideDays={true}
                modifiers={modifiers}
                localeUtils={MomentLocaleUtils}
                locale={locale}
            />
        );
    }
}
