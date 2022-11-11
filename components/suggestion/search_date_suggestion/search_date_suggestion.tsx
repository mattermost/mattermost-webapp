// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {DayPicker} from 'react-day-picker';

import Suggestion from '../suggestion.jsx';

import * as Utils from 'utils/utils';
import Constants from 'utils/constants';

import 'react-day-picker/dist/style.css';

import 'date-fns';

const loadedLocales: Record<string, moment.Locale> = {};

type Props = {
    locale: string;
    preventClose: () => void;
}

type State = {
    datePickerFocused: boolean;
}

export default class SearchDateSuggestion extends Suggestion {
    constructor(props: Props) {
        super(props);

        this.state = {
            datePickerFocused: false,
        };
    }

    handleDayClick = (day: Date) => {
        const dayString = day.toISOString().split('T')[0];
        this.props.onClick(dayString, this.props.matchedPretext);
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.DOWN) && document.activeElement?.id === 'searchBox') {
            this.setState({datePickerFocused: true});
        }
    };


    componentDidMount() {
        //the naming scheme of momentjs packages are all lowercases
        const locale = this.props.locale;

        // Momentjs use en as defualt, no need to import en
        if (locale && locale !== 'en' && !loadedLocales[locale]) {
            /* eslint-disable global-require */
            loadedLocales[locale] = require(`date-fns/locale/${locale}/index.js`);
            /* eslint-disable global-require */
        }

        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentDidUpdate(prevProps: Props) {
        const locale = this.props.locale;

        if (locale && locale !== 'en' && locale !== prevProps.locale && !loadedLocales[locale]) {
            /* eslint-disable global-require */
            loadedLocales[locale] = require(`date-fns/locale/${locale}/index.js`);
            /* eslint-disable global-require */
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    render() {
        let modifiers;
        if (this.props.currentDate) {
            modifiers = {
                today: this.props.currentDate,
            };
        }

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
