// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';
import DotMenuFlag from 'components/dot_menu/dot_menu_flag.jsx';

describe('components/dot_menu/DotMenuFlag', () => {
    const baseProps = {
        idCount: -1,
        idPrefix: Constants.CENTER,
        isFlagged: false,
        postId: 'post_id_1',
        actions: {
            flagPost: jest.fn(),
            unflagPost: jest.fn(),
        },
    };

    test('should match snapshot, unflagged on Center', () => {
        const wrapper = shallow(
            <DotMenuFlag {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click', {preventDefault: jest.fn()});
        expect(baseProps.actions.unflagPost).not.toHaveBeenCalled();
        expect(baseProps.actions.flagPost).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.flagPost).toHaveBeenCalledWith('post_id_1');

        expect(wrapper.find('#center2').exists()).toBe(false);
        wrapper.setProps({idCount: 2});
        expect(wrapper.find('#center2').exists()).toBe(true);
    });

    test('should match snapshot, flagged on RHS', () => {
        const props = {...baseProps, idPrefix: Constants.RHS, isFlagged: true};
        const wrapper = shallow(
            <DotMenuFlag {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click', {preventDefault: jest.fn()});
        expect(baseProps.actions.flagPost).not.toHaveBeenCalled();
        expect(baseProps.actions.unflagPost).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.unflagPost).toHaveBeenCalledWith('post_id_1');

        expect(wrapper.find('#rhs3').exists()).toBe(false);
        wrapper.setProps({idCount: 3});
        expect(wrapper.find('#rhs3').exists()).toBe(true);
    });

    test('should match snapshot, on RHS_ROOT', () => {
        const props = {...baseProps, idPrefix: Constants.RHS_ROOT};
        const wrapper = shallow(
            <DotMenuFlag {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#rhsroot').exists()).toBe(true);
    });
});
