// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import moment from 'moment-timezone';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import LocalDateTime from 'components/local_date_time/local_date_time.jsx';

describe('components/LocalDateTime', () => {
    beforeEach(() => {
        moment.tz.setDefault('Etc/UTC');
    });

    test('should render date without timezone', () => {
        const wrapper = mountWithIntl(
            <LocalDateTime
                eventTime={new Date('Fri Jan 12 2018 20:15:13 GMT+0800 (+08)').getTime()}
            />
        );

        expect(wrapper.find('time').prop('title')).toBe('Fri Jan 12 2018 12:15:13 GMT+0000');
        expect(wrapper.find('span').text()).toBe('12:15 PM');
    });

    test('should render date without timezone enabled', () => {
        const wrapper = mountWithIntl(
            <LocalDateTime
                eventTime={new Date('Fri Jan 12 2018 20:15:13 GMT+0800 (+08)').getTime()}
                enableTimezone={false}
                timeZone={'Australia/Sydney'}
            />
        );

        expect(wrapper.find('time').prop('title')).toBe('Fri Jan 12 2018 12:15:13 GMT+0000');
        expect(wrapper.find('span').text()).toBe('12:15 PM');
    });

    test('should render date without timezone enabled, in military time', () => {
        const wrapper = mountWithIntl(
            <LocalDateTime
                eventTime={new Date('Fri Jan 12 2018 23:15:13 GMT+0800 (+08)').getTime()}
                useMilitaryTime={true}
                enableTimezone={false}
                timeZone={'Australia/Sydney'}
            />
        );

        expect(wrapper.find('time').prop('title')).toBe('Fri Jan 12 2018 15:15:13 GMT+0000');
        expect(wrapper.find('span').text()).toBe('15:15');
    });

    test('should render date with timezone enabled, but no timezone defined', () => {
        // Clear the default set above.
        moment.tz.setDefault();

        const wrapper = mountWithIntl(
            <LocalDateTime
                eventTime={new Date('Fri Jan 12 2018 20:15:13 GMT+0000 (+00)').getTime()}
                enableTimezone={true}
            />
        );

        // Can't do an exact match here, since without a default, the timezone gets set to local
        // and will vary from machine to machine.
        expect(wrapper.find('time').prop('title')).toEqual(expect.not.stringContaining('undefined'));
    });

    test('should render date with timezone enabled', () => {
        const wrapper = mountWithIntl(
            <LocalDateTime
                eventTime={new Date('Fri Jan 12 2018 20:15:13 GMT+0000 (+00)').getTime()}
                enableTimezone={true}
                timeZone={'Australia/Sydney'}
            />
        );

        expect(wrapper.find('time').prop('title')).toBe('Sat Jan 13 2018 07:15:13 GMT+1100 (Australia/Sydney)');
        expect(wrapper.find('span').text()).toBe('7:15 AM');
    });

    test('should render date with timezone enabled, in military time', () => {
        const wrapper = mountWithIntl(
            <LocalDateTime
                eventTime={new Date('Fri Jan 12 2018 20:15:13 GMT-0800 (+00)').getTime()}
                useMilitaryTime={true}
                enableTimezone={true}
                timeZone={'Australia/Sydney'}
            />
        );

        expect(wrapper.find('time').prop('title')).toBe('Sat Jan 13 2018 15:15:13 GMT+1100 (Australia/Sydney)');
        expect(wrapper.find('span').text()).toBe('15:15');
    });
});
