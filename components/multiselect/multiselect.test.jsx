// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import MultiSelect from 'components/multiselect/multiselect.jsx';

describe('components/multiselect/multiselect', () => {
    const totalCount = 8;
    const optionsNumber = 8;
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
        perPage: 5,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <MultiSelect {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
