// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import ProgressBar from './progress_bar';

describe('admin_console/progress_bar', () => {
    test('status legend match snapshot', () => {
        const percent = 10;
        const wrapper = shallow(
            <ProgressBar percentage={percent}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('status legend shows failed', () => {
        const percent = 10;
        const wrapper = mountWithIntl(
            <ProgressBar percentage={percent}/>,
        );
        expect(wrapper).toMatchSnapshot();
        const span = wrapper.find('span');
        expect(span.last().text()).toBe('10%');
    });
});
