// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import MultiSelect from './multiselect.jsx';
import MultiSelectList from './multiselect_list.jsx';

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

    test('should match snapshot for page 2', () => {
        const wrapper = shallow(
            <MultiSelect {...baseProps}/>
        );

        wrapper.find('.filter-control__next').simulate('click');
        wrapper.update();
        expect(wrapper.state('page')).toEqual(1);
        expect(wrapper).toMatchSnapshot();
    });

    test('MultiSelectList should match state on next page', () => {
        function renderOption(option, isSelected, onAdd) {
            return (
                <p
                    key={option.id}
                    ref={isSelected ? 'selected' : option.id}
                    onClick={() => onAdd(option)}
                >
                    {option.id}
                </p>
            );
        }

        function renderValue(props) {
            return props.data.value;
        }

        const wrapper = mountWithIntl(
            <MultiSelect
                {...baseProps}
                optionRenderer={renderOption}
                valueRenderer={renderValue}
            />
        );

        const listRef = wrapper.ref('list');
        expect(listRef.setSelected).toBeTruthy();

        expect(wrapper.find(MultiSelectList).state('selected')).toEqual(-1);
        wrapper.find('.filter-control__next').simulate('click');
        expect(wrapper.find(MultiSelectList).state('selected')).toEqual(0);
    });
});
