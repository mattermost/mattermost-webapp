// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import StatusLegend from './status_legend';

describe('admin_console/status_legend', () => {
    test('status legend match snapshot', () => {
        const wrapper = shallow(
            <StatusLegend status='completed'/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('status legend shows failed', () => {
        const wrapper = mountWithIntl(
            <StatusLegend status='failed'/>,
        );
        expect(wrapper).toMatchSnapshot();
        const span = wrapper.find('span');
        expect(span.text()).toBe('Failed');
    });

    test('status legend shows completed', () => {
        const wrapper = mountWithIntl(
            <StatusLegend status='completed'/>,
        );
        expect(wrapper).toMatchSnapshot();
        const span = wrapper.find('span');
        expect(span.text()).toBe('Completed');
    });

    // commented out since the in progress icon does not exist yet and using img + gif breaks the snapshot
    // test('status legend shows in progress', () => {
    //     const wrapper = mountWithIntl(
    //         <StatusLegend status='in_progress'/>,
    //     );
    //     expect(wrapper).toMatchSnapshot();
    //     const span = wrapper.find('span');
    //     expect(span.text()).toBe('In Progress');
    // });
});
