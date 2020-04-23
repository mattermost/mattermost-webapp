// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import DateSeparator from 'components/post_view/date_separator/date_separator.jsx';

describe('components/post_view/DateSeparator', () => {
    test('should render date without timezone', () => {
        const wrapper = mountWithIntl(
            <DateSeparator
                date={new Date('Fri Jan 12 2018 20:15:13 GMT+1200 (+12)')}
            />
        );
        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find('RecentDate').text()).toBe('Fri, Jan 12, 2018');
    });

    test('should render date without timezone enabled', () => {
        const wrapper = mountWithIntl(
            <DateSeparator
                date={new Date('Fri Jan 12 2018 20:15:13 GMT+1200 (+12)')}
                enableTimezone={false}
                timeZone={'New Zealand/Auckland'}
            />
        );
        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find('RecentDate').text()).toBe('Fri, Jan 12, 2018');
    });

    test('should render date with timezone enabled', () => {
        const wrapper = mountWithIntl(
            <DateSeparator
                date={new Date('Fri Jan 12 2018 20:15:13 GMT+0000 (+00)')}
                enableTimezone={true}
                timeZone={'Australia/Sydney'}
            />
        );
        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find('RecentDate').text()).toBe('Sat, Jan 13, 2018');
    });
});
