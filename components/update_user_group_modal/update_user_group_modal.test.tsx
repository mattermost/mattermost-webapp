// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';

import UpdateUserGroupModal from './update_user_group_modal';

describe('component/update_user_group_modal', () => {
    const baseProps = {
        onExited: jest.fn(),
        groupId: 'groupid123',
        group: {
            id: 'groupid123',
            name: 'group',
            display_name: 'Group Name',
            description: 'Group description',
            source: 'custom',
            remote_id: null,
            create_at: 1637349374137,
            update_at: 1637349374137,
            delete_at: 0,
            has_syncables: false,
            member_count: 6,
            allow_reference: true,
            scheme_admin: false,
        },
        backButtonCallback: jest.fn(),
        actions: {
            patchGroup: jest.fn().mockImplementation(() => Promise.resolve()),
            openModal: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <UpdateUserGroupModal
                {...baseProps}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should update group', () => {
        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
            />,
        );
        wrapper.setState({name: 'Ursa', mention: 'ursa'});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('');
        });
    });

    test('mention regex error', () => {
        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
            />,
        );
        wrapper.setState({name: 'Ursa', mention: 'ursa!/'});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(0);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('Invalid character in mention.');
        });
    });

    test('fail to update with empty name', () => {
        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
            />,
        );
        wrapper.setState({name: '', mention: 'ursa'});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(0);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('nameInputErrorText')).toEqual('Name is a required field.');
        });
    });

    test('fail to update with empty mention', () => {
        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
            />,
        );
        wrapper.setState({name: 'Ursa', mention: ''});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(0);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('Mention is a required field.');
        });
    });

    test('should update when mention begins with @', () => {
        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
            />,
        );
        wrapper.setState({name: 'Ursa', mention: '@ursa'});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('');
            expect(wrapper.state('nameInputErrorText')).toEqual('');
        });
    });

    test('should fail to update with unknown error', () => {
        const patchGroup = jest.fn().mockImplementation(() => Promise.resolve({error: {message: 'test error', server_error_id: 'insert_error'}}));

        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
                actions={{
                    ...baseProps.actions,
                    patchGroup,
                }}
            />,
        );
        wrapper.setState({name: 'Ursa', mention: '@ursa'});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(true);
            expect(wrapper.state('mentionInputErrorText')).toEqual('');
            expect(wrapper.state('nameInputErrorText')).toEqual('');
        });
    });

    test('should fail to create with duplicate mention error', () => {
        const patchGroup = jest.fn().mockImplementation(() => Promise.resolve({error: {message: 'test error', server_error_id: 'app.group.save_not_unique.name_error'}}));

        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
                actions={{
                    ...baseProps.actions,
                    patchGroup,
                }}
            />,
        );
        wrapper.setState({name: 'Ursa', mention: '@ursa'});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('Mention needs to be unique.');
            expect(wrapper.state('nameInputErrorText')).toEqual('');
        });
    });
});
