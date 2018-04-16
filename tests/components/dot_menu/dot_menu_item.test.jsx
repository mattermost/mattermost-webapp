// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {showGetPostLinkModal} from 'actions/global_actions.jsx';
import DotMenuItem from 'components/dot_menu/dot_menu_item.jsx';

jest.mock('actions/global_actions.jsx', () => {
    return {
        showGetPostLinkModal: jest.fn(),
    };
});

describe('components/dot_menu/DotMenuItem', () => {
    test('should match snapshot, on Reply', () => {
        const props = {
            idPrefix: 'idPrefixDotMenuReply',
            idCount: -1,
            handleOnClick: jest.fn(),
            actions: {
                pinPost: jest.fn(),
                unpinPost: jest.fn(),
                openModal: jest.fn(),
            },
        };

        const wrapper = shallow(
            <DotMenuItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click');
        expect(props.handleOnClick).toHaveBeenCalledTimes(1);

        expect(wrapper.find('#idPrefixDotMenuReply2').exists()).toBe(false);
        wrapper.setProps({idCount: 2});
        expect(wrapper.find('#idPrefixDotMenuReply2').exists()).toBe(true);
    });

    test('should match snapshot, on Permalink', () => {
        const props = {
            idPrefix: 'idPrefixDotMenuPermalink',
            idCount: -1,
            post: {id: 'post_id_1'},
            actions: {
                pinPost: jest.fn(),
                unpinPost: jest.fn(),
                openModal: jest.fn(),
            },
        };

        const wrapper = shallow(
            <DotMenuItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click', {preventDefault: jest.fn()});
        expect(showGetPostLinkModal).toHaveBeenCalledTimes(1);

        expect(wrapper.find('#idPrefixDotMenuPermalink3').exists()).toBe(false);
        wrapper.setProps({idCount: 3});
        expect(wrapper.find('#idPrefixDotMenuPermalink3').exists()).toBe(true);
    });

    test('should match snapshot, on Pin - unpinned', () => {
        const props = {
            idPrefix: 'idPrefixDotMenuPin',
            idCount: -1,
            post: {id: 'post_id_1', is_pinned: false},
            actions: {
                pinPost: jest.fn(),
                unpinPost: jest.fn(),
                openModal: jest.fn(),
            },
        };

        const wrapper = shallow(
            <DotMenuItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click', {preventDefault: jest.fn()});
        expect(props.actions.unpinPost).not.toHaveBeenCalled();
        expect(props.actions.pinPost).toHaveBeenCalledTimes(1);
        expect(props.actions.pinPost).toHaveBeenCalledWith('post_id_1');

        expect(wrapper.find('#idPrefixDotMenuPin4').exists()).toBe(false);
        wrapper.setProps({idCount: 4});
        expect(wrapper.find('#idPrefixDotMenuPin4').exists()).toBe(true);
    });

    test('should match snapshot, on Pin - pinned', () => {
        const props = {
            idPrefix: 'idPrefixDotMenuPin',
            idCount: 5,
            post: {id: 'post_id_2', is_pinned: true},
            actions: {
                pinPost: jest.fn(),
                unpinPost: jest.fn(),
                openModal: jest.fn(),
            },
        };

        const wrapper = shallow(
            <DotMenuItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click', {preventDefault: jest.fn()});
        expect(props.actions.pinPost).not.toHaveBeenCalled();
        expect(props.actions.unpinPost).toHaveBeenCalledTimes(1);
        expect(props.actions.unpinPost).toHaveBeenCalledWith('post_id_2');
    });

    test('should match snapshot, on Delete', () => {
        const props = {
            idPrefix: 'idPrefixDotMenuDelete',
            idCount: -1,
            post: {id: 'post_id_1'},
            commentCount: 0,
            actions: {
                pinPost: jest.fn(),
                unpinPost: jest.fn(),
                openModal: jest.fn(),
            },
        };

        const wrapper = shallow(
            <DotMenuItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click', {preventDefault: jest.fn()});
        expect(props.actions.openModal).toHaveBeenCalledTimes(1);

        expect(wrapper.find('#idPrefixDotMenuDelete5').exists()).toBe(false);
        wrapper.setProps({idCount: 5});
        expect(wrapper.find('#idPrefixDotMenuDelete5').exists()).toBe(true);
    });

    test('should match snapshot, on RHS_ROOT', () => {
        const props = {
            idPrefix: 'rhsrootDotMenuDelete',
            idCount: -1,
            post: {id: 'post_id_1'},
            commentCount: 0,
        };
        const wrapper = shallow(
            <DotMenuItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#rhsrootDotMenuDelete').exists()).toBe(true);
    });
});
