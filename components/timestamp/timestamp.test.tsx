// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import moment from 'moment';

import {shallowWithIntl, mountWithIntl} from 'tests/helpers/intl-test-helper';

import Timestamp from './timestamp';
import SemanticTime from './semantic_time';

import {RelativeRanges} from './index';

function daysFromNow(diff: number) {
    const date = new Date();
    date.setDate(date.getDate() + diff);
    return date;
}

describe('components/Timestamp', () => {
    test('should be wrapped in SemanticTime', () => {
        const date = new Date('2020-06-05T10:20:30Z');
        const wrapper = shallowWithIntl(
            <Timestamp
                value={date}
                useTime={false}

            />
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(SemanticTime).exists());
    });

    test('should render Today', () => {
        const wrapper = mountWithIntl(
            <Timestamp
                value={daysFromNow(0)}
                useTime={false}
                ranges={[
                    RelativeRanges.TODAY_TITLE_CASE
                ]}
            />
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.text()).toEqual('Today');
    });

    test('should render today', () => {
        const wrapper = mountWithIntl(
            <Timestamp
                value={daysFromNow(0)}
                useTime={false}
                ranges={[
                    RelativeRanges.TODAY_YESTERDAY
                ]}
            />
        );

        expect(wrapper.text()).toEqual('today');
    });

    test('should render Yesterday', () => {
        const wrapper = mountWithIntl(
            <Timestamp
                value={daysFromNow(-1)}
                useTime={false}
                ranges={[
                    RelativeRanges.YESTERDAY_TITLE_CASE
                ]}
            />
        );

        expect(wrapper.text()).toEqual('Yesterday');
    });

    test('should render yesterday', () => {
        const wrapper = mountWithIntl(
            <Timestamp
                value={daysFromNow(-1)}
                useTime={false}
                ranges={[
                    RelativeRanges.TODAY_YESTERDAY
                ]}
            />
        );

        expect(wrapper.text()).toEqual('yesterday');
    });

    test('should render 3 days ago', () => {
        const wrapper = mountWithIntl(
            <Timestamp
                value={daysFromNow(-3)}
                useTime={false}
                unit='day'
            />
        );

        expect(wrapper.text()).toEqual('3 days ago');
    });

    test('should render 3 days ago as weekday', () => {
        const date = daysFromNow(-3);
        const wrapper = mountWithIntl(
            <Timestamp
                value={date}
                useTime={false}
            />
        );

        expect(wrapper.text()).toEqual(moment(date).format('dddd'));
    });

    test('should render 6 days ago as weekday', () => {
        const date = daysFromNow(-6);
        const wrapper = mountWithIntl(
            <Timestamp
                value={date}
                useTime={false}
            />
        );

        expect(wrapper.text()).toEqual(moment(date).format('dddd'));
    });

    test('should render 2 days ago as weekday in supported timezone', () => {
        const date = daysFromNow(-2);
        const wrapper = mountWithIntl(
            <Timestamp
                value={date}
                timeZone='Asia/Manila'
                useTime={false}
            />
        );

        expect(wrapper.text()).toEqual(moment(date).tz('Asia/Manila').format('dddd'));
    });

    test('should render date without timezone', () => {
        const wrapper = mountWithIntl(
            <Timestamp
                value={new Date('Fri Jan 12 2018 20:15:13 GMT+0800 (+08)').getTime()}
                useDate={false}
            />,
        );

        expect(wrapper.find('time').prop('title')).toBe('Fri Jan 12 2018 12:15:13 GMT+0000');
        expect(wrapper.find('span').text()).toBe('12:15 PM');
    });

    test('should render date without timezone enabled', () => {
        const wrapper = mountWithIntl(
            <Timestamp
                value={new Date('Fri Jan 12 2018 20:15:13 GMT+0800 (+08)').getTime()}
                useDate={false}
                timeZone={'Australia/Sydney'}
            />,
        );

        expect(wrapper.find('time').prop('title')).toBe('Fri Jan 12 2018 12:15:13 GMT+0000');
        expect(wrapper.find('span').text()).toBe('12:15 PM');
    });

    test('should render date without timezone enabled, in military time', () => {
        const wrapper = mountWithIntl(
            <Timestamp
                eventTime={new Date('Fri Jan 12 2018 23:15:13 GMT+0800 (+08)').getTime()}
                useMilitaryTime={true}
                enableTimezone={false}
                timeZone={'Australia/Sydney'}
            />,
        );

        expect(wrapper.find('time').prop('title')).toBe('Fri Jan 12 2018 15:15:13 GMT+0000');
        expect(wrapper.find('span').text()).toBe('15:15');
    });

    test('should render date with timezone enabled, but no timezone defined', () => {
        const wrapper = mountWithIntl(
            <Timestamp
                value={new Date('Fri Jan 12 2018 20:15:13 GMT+0000 (+00)').getTime()}
                enableTimezone={true}
            />,
        );

        // Can't do an exact match here, since without a default, the timezone gets set to local
        // and will vary from machine to machine.
        expect(wrapper.find('time').prop('title')).toEqual(expect.not.stringContaining('undefined'));
    });

    test('should render date with timezone enabled', () => {
        const baseProps = {
            eventTime: new Date('Fri Jan 12 2018 20:15:13 GMT+0000 (+00)').getTime(),
            enableTimezone: true,
            timeZone: 'Australia/Sydney',
        };

        const wrapper = mountWithIntl(<Timestamp {...baseProps}/>);
        expect(wrapper.find('time').prop('title')).toBe('Sat Jan 13 2018 07:15:13 GMT+1100 (Australia/Sydney)');
        expect(wrapper.find('span').text()).toBe('7:15 AM');
    });

    test('should render date with unsupported timezone enabled', () => {
        const baseProps = {
            eventTime: new Date('Fri Jan 12 2018 20:15:13 GMT+0000 (+00)').getTime(),
            enableTimezone: true,
            timeZone: 'US/Hawaii',
        };

        const wrapper = mountWithIntl(
            <Timestamp
                {...baseProps}
            />,
        );
        expect(wrapper.find('time').prop('title')).toBe('Fri Jan 12 2018 10:15:13 GMT-1000 (US/Hawaii)');
        expect(wrapper.find('span').text()).toBe('10:15 AM');
    });

    test('should render date with timezone enabled, in military time', () => {
        const baseProps = {
            eventTime: new Date('Fri Jan 12 2018 20:15:13 GMT-0800 (+00)').getTime(),
            useMilitaryTime: true,
            enableTimezone: true,
            timeZone: 'Australia/Sydney',
        };

        const wrapper = mountWithIntl(<Timestamp {...baseProps}/>);

        expect(wrapper.find('time').prop('title')).toBe('Sat Jan 13 2018 15:15:13 GMT+1100 (Australia/Sydney)');
        expect(wrapper.find('span').text()).toBe('15:15');
    });

    test('should render date with unsupported timezone enabled, in military time', () => {
        const baseProps = {
            eventTime: new Date('Fri Jan 12 2018 20:15:13 GMT-0800 (+00)').getTime(),
            useMilitaryTime: true,
            enableTimezone: true,
            timeZone: 'US/Alaska',
        };

        const wrapper = mountWithIntl(
            <Timestamp
                {...baseProps}
            />,
        );
        expect(wrapper.find('time').prop('title')).toBe('Fri Jan 12 2018 19:15:13 GMT-0900 (US/Alaska)');
        expect(wrapper.find('span').text()).toBe('19:15');
    });

    // test('should render title-case "Yesterday" yesterday', () => {
    //     const yesterday = new Date();
    //     yesterday.setDate(yesterday.getDate() - 1);

    //     const props = {
    //         value: yesterday,
    //     };

    //     const wrapper = shallowWithIntl(<Timestamp {...props}/>);

    //     expect(wrapper.find(FormattedMessage).exists()).toBe(true);
    //     expect(wrapper.find(FormattedMessage).prop('id')).toBe('date_separator.yesterday');
    // });

    // test('should render "today" today', () => {
    //     const today = new Date();

    //     const props = {
    //         value: today,
    //         useTitleCase: false
    //     };

    //     const wrapper = shallowWithIntl(<Timestamp {...props}/>);

    //     expect(wrapper.find(FormattedRelativeTime).exists()).toBe(true);
    //     expect(wrapper.find(FormattedRelativeTime).prop('value')).toBe(0);
    //     expect(wrapper.find(FormattedRelativeTime).prop('unit')).toBe('day');
    // });

    // test('should render "yesterday" yesterday', () => {
    //     const yesterday = new Date();
    //     yesterday.setDate(yesterday.getDate() - 1);

    //     const props = {
    //         value: yesterday,
    //         useTitleCase: false
    //     };

    //     const wrapper = shallowWithIntl(<Timestamp {...props}/>);

    //     expect(wrapper.find(FormattedRelativeTime).exists()).toBe(true);
    //     expect(wrapper.find(FormattedRelativeTime).prop('value')).toBe(-1);
    //     expect(wrapper.find(FormattedRelativeTime).prop('unit')).toBe('day');
    // });

    // test('should render date two days ago', () => {
    //     const twoDaysAgo = new Date();
    //     twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    //     const props = {
    //         value: twoDaysAgo,
    //     };

    //     const wrapper = shallowWithIntl(<Timestamp {...props}/>);

    //     expect(WEEKDAYS).toContain(wrapper.text());
    // });

    // test('should render date two days ago for supported timezone', () => {
    //     const twoDaysAgo = new Date();
    //     twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    //     const props = {
    //         timeZone: 'Asia/Manila',
    //         value: twoDaysAgo,
    //     };

    //     const wrapper = shallowWithIntl(<Timestamp {...props}/>);

    //     expect(WEEKDAYS).toContain(wrapper.text());
    // });

    // test('should render date two days ago', () => {
    //     const twoDaysAgo = new Date();
    //     twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    //     const props = {
    //         value: twoDaysAgo,
    //     };

    //     const wrapper = shallowWithIntl(<Timestamp {...props}/>);

    //     expect(WEEKDAYS).toContain(wrapper.text());
    // });

    // test('should render date from eleven days ago', () => {
    //     const xAgo = new Date();
    //     xAgo.setDate(xAgo.getDate() - 11);

    //     const props = {
    //         value: xAgo,
    //     };

    //     const wrapper = shallowWithIntl(<Timestamp {...props}/>);

    //     expect(wrapper.text()).toMatch(xAgo.getFullYear() === NOW.getFullYear() ? MONTH_DAY : MONTH_DAY_YEAR);
    // });

    // test('should render date from 365 days ago', () => {
    //     const xAgo = new Date();
    //     xAgo.setDate(xAgo.getDate() - 365);

    //     const props = {
    //         value: xAgo,
    //     };

    //     const wrapper = shallowWithIntl(<Timestamp {...props}/>);

    //     expect(wrapper.text()).toMatch(MONTH_DAY_YEAR);
    // });

    // test('should render 2 days ago with explicit format options', () => {
    //     const xAgo = new Date();
    //     xAgo.setDate(xAgo.getDate() - 2);

    //     const props = {
    //         value: xAgo,
    //     };

    //     const wrapper = shallowWithIntl(<Timestamp {...props}/>);

    //     expect(wrapper.text()).toMatch(MONTH_DAY_YEAR);
    // });
});

// describe('isToday and isYesterday', () => {
//     test('tomorrow at 12am', () => {
//         const date = new Date();
//         date.setDate(date.getDate() + 1);
//         date.setHours(0);
//         date.setMinutes(0);

//         expect(isToday(date)).toBe(false);
//         expect(isYesterday(date)).toBe(false);
//     });

//     test('now', () => {
//         const date = new Date();

//         expect(isToday(date)).toBe(true);
//         expect(isYesterday(date)).toBe(false);
//     });

//     test('today at 12am', () => {
//         const date = new Date();
//         date.setHours(0);
//         date.setMinutes(0);

//         expect(isToday(date)).toBe(true);
//         expect(isYesterday(date)).toBe(false);
//     });

//     test('today at 11:59pm', () => {
//         const date = new Date();
//         date.setHours(23);
//         date.setMinutes(59);

//         expect(isToday(date)).toBe(true);
//         expect(isYesterday(date)).toBe(false);
//     });

//     test('yesterday at 11:59pm', () => {
//         const date = new Date();
//         date.setDate(date.getDate() - 1);
//         date.setHours(23);
//         date.setMinutes(59);

//         expect(isToday(date)).toBe(false);
//         expect(isYesterday(date)).toBe(true);
//     });

//     test('yesterday at 12am', () => {
//         const date = new Date();
//         date.setDate(date.getDate() - 1);
//         date.setHours(0);
//         date.setMinutes(0);

//         expect(isToday(date)).toBe(false);
//         expect(isYesterday(date)).toBe(true);
//     });

//     test('two days ago at 11:59pm', () => {
//         const date = new Date();
//         date.setDate(date.getDate() - 2);
//         date.setHours(23);
//         date.setMinutes(59);

//         expect(isToday(date)).toBe(false);
//         expect(isYesterday(date)).toBe(false);
//     });
// });
