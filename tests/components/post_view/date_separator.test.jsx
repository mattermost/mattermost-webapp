// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import DateSeparator from 'components/post_view/date_separator.jsx';

describe('components/post_view/DateSeparator', () => {
    test('should match snapshot', () => {
        const wrapper = mountWithIntl(<DateSeparator date={new Date('Fri Jan 12 2018 20:15:13 GMT+0800 (+08)')}/>);
        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find('span').text()).toBe('Fri, Jan 12, 2018');
    });
});
