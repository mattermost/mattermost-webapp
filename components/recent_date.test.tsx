// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import moment from 'moment-timezone';
import {FormattedMessage, FormattedRelativeTime} from 'react-intl';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import RecentDate, {
    isToday,
    isYesterday,
} from './recent_date';

const NOW = new Date();
const WEEKDAYS = moment.weekdays(); // Monday

// Date format for "MMMM DD" (en-US)
const MONTH_DAY = /^[a-zA-Z]{3,9} \d{2}$/;

// Date format for "MMMM DD, YYYY" (en-US)
const MONTH_DAY_YEAR = /^[a-zA-Z]{3,9} \d{2}, \d{4}$/;

describe('RecentDate', () => {
    test('should render title-case "Today" today', () => {
        const today = new Date();

        const props = {
            value: today
        };

        const wrapper = shallowWithIntl(<RecentDate {...props}/>);

        expect(wrapper.find(FormattedMessage).exists()).toBe(true);
        expect(wrapper.find(FormattedMessage).prop('id')).toBe('date_separator.today');
    });

    test('should render title-case "Yesterday" yesterday', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const props = {
            value: yesterday,
        };

        const wrapper = shallowWithIntl(<RecentDate {...props}/>);

        expect(wrapper.find(FormattedMessage).exists()).toBe(true);
        expect(wrapper.find(FormattedMessage).prop('id')).toBe('date_separator.yesterday');
    });

    test('should render "today" today', () => {
        const today = new Date();

        const props = {
            value: today,
            useTitleCase: false
        };

        const wrapper = shallowWithIntl(<RecentDate {...props}/>);

        expect(wrapper.find(FormattedRelativeTime).exists()).toBe(true);
        expect(wrapper.find(FormattedRelativeTime).prop('value')).toBe(0);
        expect(wrapper.find(FormattedRelativeTime).prop('unit')).toBe('day');
    });

    test('should render "yesterday" yesterday', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const props = {
            value: yesterday,
            useTitleCase: false
        };

        const wrapper = shallowWithIntl(<RecentDate {...props}/>);

        expect(wrapper.find(FormattedRelativeTime).exists()).toBe(true);
        expect(wrapper.find(FormattedRelativeTime).prop('value')).toBe(-1);
        expect(wrapper.find(FormattedRelativeTime).prop('unit')).toBe('day');
    });

    test('should render date two days ago', () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const props = {
            value: twoDaysAgo,
        };

        const wrapper = shallowWithIntl(<RecentDate {...props}/>);

        expect(WEEKDAYS).toContain(wrapper.text());
    });

    test('should render date two days ago for supported timezone', () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const props = {
            timeZone: 'Asia/Manila',
            value: twoDaysAgo,
        };

        const wrapper = shallowWithIntl(<RecentDate {...props}/>);

        expect(WEEKDAYS).toContain(wrapper.text());
    });

    test('should render date two days ago', () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const props = {
            value: twoDaysAgo,
        };

        const wrapper = shallowWithIntl(<RecentDate {...props}/>);

        expect(WEEKDAYS).toContain(wrapper.text());
    });

    test('should render date from eleven days ago', () => {
        const xAgo = new Date();
        xAgo.setDate(xAgo.getDate() - 11);

        const props = {
            value: xAgo,
        };

        const wrapper = shallowWithIntl(<RecentDate {...props}/>);

        expect(wrapper.text()).toMatch(xAgo.getFullYear() === NOW.getFullYear() ? MONTH_DAY : MONTH_DAY_YEAR);
    });

    test('should render date from 365 days ago', () => {
        const xAgo = new Date();
        xAgo.setDate(xAgo.getDate() - 365);

        const props = {
            value: xAgo,
        };

        const wrapper = shallowWithIntl(<RecentDate {...props}/>);

        expect(wrapper.text()).toMatch(MONTH_DAY_YEAR);
    });

    test('should render 2 days ago with explicit format options', () => {
        const xAgo = new Date();
        xAgo.setDate(xAgo.getDate() - 2);

        const props = {
            value: xAgo,
            dateTimeFormat: {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }
        };

        const wrapper = shallowWithIntl(<RecentDate {...props}/>);

        expect(wrapper.text()).toMatch(MONTH_DAY_YEAR);
    });

});

describe('isToday and isYesterday', () => {
    test('tomorrow at 12am', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(0);
        date.setMinutes(0);

        expect(isToday(date)).toBe(false);
        expect(isYesterday(date)).toBe(false);
    });

    test('now', () => {
        const date = new Date();

        expect(isToday(date)).toBe(true);
        expect(isYesterday(date)).toBe(false);
    });

    test('today at 12am', () => {
        const date = new Date();
        date.setHours(0);
        date.setMinutes(0);

        expect(isToday(date)).toBe(true);
        expect(isYesterday(date)).toBe(false);
    });

    test('today at 11:59pm', () => {
        const date = new Date();
        date.setHours(23);
        date.setMinutes(59);

        expect(isToday(date)).toBe(true);
        expect(isYesterday(date)).toBe(false);
    });

    test('yesterday at 11:59pm', () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        date.setHours(23);
        date.setMinutes(59);

        expect(isToday(date)).toBe(false);
        expect(isYesterday(date)).toBe(true);
    });

    test('yesterday at 12am', () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        date.setHours(0);
        date.setMinutes(0);

        expect(isToday(date)).toBe(false);
        expect(isYesterday(date)).toBe(true);
    });

    test('two days ago at 11:59pm', () => {
        const date = new Date();
        date.setDate(date.getDate() - 2);
        date.setHours(23);
        date.setMinutes(59);

        expect(isToday(date)).toBe(false);
        expect(isYesterday(date)).toBe(false);
    });
});
