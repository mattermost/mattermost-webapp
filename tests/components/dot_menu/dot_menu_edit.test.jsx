// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';

import DotMenuEdit from 'components/dot_menu/dot_menu_edit.jsx';

describe('components/integrations/DotMenuEdit', () => {
    const baseProps = {
        idCount: -1,
        idPrefix: Constants.CENTER,
        post: {id: 'post_id_1'},
        type: 'Post',
        commentsCount: 1,
        actions: {setEditingPost: jest.fn()}
    };

    test('should match snapshot, on Center', () => {
        const wrapper = shallow(
            <DotMenuEdit {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click');
        expect(baseProps.actions.setEditingPost).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.setEditingPost).toHaveBeenCalledWith('post_id_1', 1, 'post_textbox', 'Post');

        expect(wrapper.find('#center2').exists()).toBe(false);
        wrapper.setProps({idCount: 2});
        expect(wrapper.find('#center2').exists()).toBe(true);
    });

    test('should match snapshot, on RHS', () => {
        const props = {...baseProps, type: 'Comment', idPrefix: Constants.RHS};
        const wrapper = shallow(
            <DotMenuEdit {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click');
        expect(baseProps.actions.setEditingPost).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.setEditingPost).toHaveBeenCalledWith('post_id_1', 1, 'reply_textbox', 'Comment');

        expect(wrapper.find('#rhs3').exists()).toBe(false);
        wrapper.setProps({idCount: 3});
        expect(wrapper.find('#rhs3').exists()).toBe(true);
    });

    test('should match snapshot, on RHS_ROOT', () => {
        const props = {...baseProps, type: 'Comment', idPrefix: Constants.RHS_ROOT};
        const wrapper = shallow(
            <DotMenuEdit {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#rhsroot').exists()).toBe(true);
    });
});
