// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {DayPicker} from 'react-day-picker';

import type {Locale} from 'date-fns';

import Suggestion from '../suggestion.jsx';

import * as Utils from 'utils/utils';
import Constants from 'utils/constants';

import 'react-day-picker/dist/style.css';

const loadedLocales: Record<string, Locale> = {};

type Props = {
    locale: string;
}

export default class SearchDateSuggestion extends Suggestion {
    state = {
        datePickerFocused: false,
    };

    handleDayClick = (day: Date) => {
        const dayString = day.toISOString().split('T')[0];
        this.props.onClick(dayString, this.props.matchedPretext);
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.DOWN) && document.activeElement?.id === 'searchBox') {
            this.setState({datePickerFocused: true});
        }
    };

    localeExists = (path: string) => {
        try {
            require.resolve(path);
            return true;
        } catch (e) {
            return false;
        }
    }

    componentDidMount() {
        const locale = this.props.locale;

        // Default value is en-US
        if (locale && locale !== 'en-US' && !loadedLocales[locale] && this.localeExists(`date-fns/locale/${locale}/index.js`)) {
            /* eslint-disable global-require */
            loadedLocales[locale] = require(`date-fns/locale/${locale}/index.js`);
            /* eslint-disable global-require */
        }

        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentDidUpdate(prevProps: Props) {
        const locale = this.props.locale;

        if (locale && locale !== 'en-US' && locale !== prevProps.locale && !loadedLocales[locale] && this.localeExists(`date-fns/locale/${locale}/index.js`)) {
            /* eslint-disable global-require */
            loadedLocales[locale] = require(`date-fns/locale/${locale}/index.js`);
            /* eslint-disable global-require */
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    render() {
        const locale: string = this.props.locale;

        return (
            <DayPicker
                onDayClick={this.handleDayClick}
                showOutsideDays={true}
                mode={'single'}
                locale={loadedLocales[locale]}
                initialFocus={this.state.datePickerFocused}
                onMonthChange={this.props.preventClose}
                id='searchDatePicker'
            />
        );
    }
}
