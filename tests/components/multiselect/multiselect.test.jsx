// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import MultiSelect from 'components/multiselect/multiselect.jsx';

describe('components/multiselect/multiselect', () => {
    const totalCount = 80;
    const optionsNumber = 80;
    const users = [];
    for (var i = 0; i < optionsNumber; i++) {
        users.push({id: i, value: i});
    }

    const baseProps = {
        users,
        totalCount,
        values: [{id: 100, value: 100}],
        saving: false,
        options: users,
        perPage: 50,
    };

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <MultiSelect {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for page 2', () => {
        const wrapper = mountWithIntl(
            <MultiSelect {...baseProps}/>
        );

        wrapper.find('.filter-control__next').simulate('click');
        wrapper.update();
        expect(wrapper.state('page')).toEqual(1);
        expect(wrapper).toMatchSnapshot();
    });
});
