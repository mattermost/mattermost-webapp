// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow, mount} from 'enzyme';

import MultiSelect from 'components/multiselect/multiselect.jsx';
import {MultiSelectList} from 'components/multiselect/multiselect_list.jsx';
import MenuWrapperAnimation from 'components/widgets/menu/menu_wrapper_animation';

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

    test('should call setSelected on page change', () => {
        const wrapper = shallow(
            <MultiSelect {...baseProps}/>
        );

        wrapper.instance().refs = {list: {setSelected: jest.fn()}};
        const spy = jest.spyOn(wrapper.instance().refs.list, 'setSelected');

        wrapper.find('.filter-control__next').simulate('click');
        wrapper.update();

        expect(spy).toHaveBeenCalled();
    });
});
