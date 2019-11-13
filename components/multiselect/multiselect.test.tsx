// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';
import {StateManager} from 'react-select/src/stateManager';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import MultiSelect from './multiselect';
import MultiSelectList, {Props as MultiSelectProps} from './multiselect_list';

const element = (props: any) => <div/>;

describe('components/multiselect/multiselect', () => {
    const totalCount = 8;
    const optionsNumber = 8;
    const users = [];
    for (let i = 0; i < optionsNumber; i++) {
        users.push({id: `${i}`, label: `${i}`, value: `${i}`});
    }

    const baseProps = {
        ariaLabelRenderer: element as any,
        handleAdd: jest.fn(),
        handleDelete: jest.fn(),
        handleInput: jest.fn(),
        handleSubmit: jest.fn(),
        optionRenderer: element,
        options: users,
        perPage: 5,
        saving: false,
        totalCount,
        users,
        valueRenderer: element as any,
        values: [{id: 'id', label: 'label', value: 'value'}],
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
        const renderOption: MultiSelectProps['optionRenderer'] = (option, isSelected, onAdd) => {
            return (
                <p
                    key={option.id}
                    ref={isSelected ? 'selected' : option.id}
                    onClick={() => onAdd(option)}
                >
                    {option.id}
                </p>
            );
        };

        const renderValue = (props: {data: {value: unknown}}) => {
            return props.data.value;
        };

        const wrapper = mountWithIntl(
            <MultiSelect
                {...baseProps}
                optionRenderer={renderOption}
                valueRenderer={renderValue as unknown as typeof StateManager}
            />
        );

        expect(wrapper.find(MultiSelectList).state('selected')).toEqual(-1);
        wrapper.find('.filter-control__next').simulate('click');
        expect(wrapper.find(MultiSelectList).state('selected')).toEqual(0);
    });
});
