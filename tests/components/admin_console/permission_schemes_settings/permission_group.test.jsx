// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PermissionGroup from 'components/admin_console/permission_schemes_settings/permission_group.jsx';

describe('components/admin_console/permission_schemes_settings/permission_group', () => {
    const defaultProps = {
        id: 'name',
        permissions: ['invite_user', 'add_user_to_team'],
        readOnly: false,
        role: {
            permissions: [],
        },
        parentRole: null,
        scope: 'team_scope',
        value: 'checked',
        onChange: jest.fn(),
    };

    test('should match snapshot on editable without permissions', () => {
        const wrapper = shallow(
            <PermissionGroup {...defaultProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on editable without every permission out of the scope', () => {
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                scope={'system_scope'}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on editable with some permissions', () => {
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                role={{permissions: ['invite_user']}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on editable with all permissions', () => {
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                role={{permissions: ['invite_user', 'add_user_to_team']}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on editable without permissions and read-only', () => {
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                readOnly={true}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on editable with some permissions and read-only', () => {
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                role={{permissions: ['invite_user']}}
                readOnly={true}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on editable with all permissions and read-only', () => {
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                role={{permissions: ['invite_user', 'add_user_to_team']}}
                readOnly={true}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on editable with some permissions from parentRole', () => {
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                parentRole={{permissions: ['invite_user']}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on editable with all permissions from parentRole', () => {
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                parentRole={{permissions: ['invite_user', 'add_user_to_team']}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should expand and collapse correctly, expanded by default, collapsed and then expanded again', () => {
        const wrapper = shallow(
            <PermissionGroup {...defaultProps}/>
        );
        expect(wrapper).toMatchSnapshot();
        wrapper.find('.permission-arrow').first().simulate('click', {stopPropagation: jest.fn()});
        expect(wrapper).toMatchSnapshot();
        wrapper.find('.permission-arrow').first().simulate('click', {stopPropagation: jest.fn()});
        expect(wrapper).toMatchSnapshot();
    });

    test('should call correctly onChange function on click without permissions', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                onChange={onChange}
            />
        );
        wrapper.find('.permission-group-row').first().simulate('click');
        expect(onChange).toBeCalledWith(['invite_user', 'add_user_to_team']);
    });

    test('should call correctly onChange function on click with some permissions', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                role={{permissions: ['invite_user']}}
                onChange={onChange}
            />
        );
        wrapper.find('.permission-group-row').first().simulate('click');
        expect(onChange).toBeCalledWith(['add_user_to_team']);
    });

    test('should call correctly onChange function on click with all permissions', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                role={{permissions: ['invite_user', 'add_user_to_team']}}
                onChange={onChange}
            />
        );
        wrapper.find('.permission-group-row').first().simulate('click');
        expect(onChange).toBeCalledWith(['invite_user', 'add_user_to_team']);
    });

    test('shouldn\'t call onChange function on click when is read-only', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                readOnly={true}
                onChange={onChange}
            />
        );
        wrapper.find('.permission-group-row').first().simulate('click');
        expect(onChange).not.toBeCalled();
    });

    test('shouldn\'t call onChange function on click when is read-only', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <PermissionGroup
                {...defaultProps}
                readOnly={true}
                onChange={onChange}
            />
        );
        wrapper.find('.permission-group-row').first().simulate('click');
        expect(onChange).not.toBeCalled();
    });
});
