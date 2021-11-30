// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';
import CreateUserGroupsModal from './create_user_groups_modal';
import {UserProfile} from 'mattermost-redux/types/users';

import {Value} from 'components/multiselect/multiselect';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

type UserProfileValue = Value & UserProfile;

describe('component/user_groups_modal', () => {
    const users = [{
        id: 'user-1',
        label: 'user-1',
        value: 'user-1',
        delete_at: 0,
    } as UserProfileValue, {
        id: 'user-2',
        label: 'user-2',
        value: 'user-2',
        delete_at: 0,
    } as UserProfileValue];

    const baseProps = {
        onExited: jest.fn(),
        backButtonCallback: jest.fn(),
        actions: {
            openModal: jest.fn(),
            createGroupWithUserIds: jest.fn().mockImplementation(() => Promise.resolve()),
        },
    };

    test('should match snapshot with back button', () => {
        const wrapper = shallow(
            <CreateUserGroupsModal
                {...baseProps}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot without back button', () => {
        const wrapper = shallow(
            <CreateUserGroupsModal
                {...baseProps}
                backButtonCallback={undefined}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot create group', () => {
        const wrapper = shallow<CreateUserGroupsModal>(
            <CreateUserGroupsModal
                {...baseProps}
            />
        );
        wrapper.setState({name: 'Ursa', mention: 'ursa', usersToAdd: users});
        wrapper.instance().createGroup(users);
        expect(wrapper.instance().props.actions.createGroupWithUserIds).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('');
        });
    });

    test('should match snapshot, mention regex error', () => {
        const wrapper = shallow<CreateUserGroupsModal>(
            <CreateUserGroupsModal
                {...baseProps}
            />
        );
        wrapper.setState({name: 'Ursa', mention: 'ursa!/'});
        wrapper.instance().createGroup(users);
        expect(wrapper.instance().props.actions.createGroupWithUserIds).toHaveBeenCalledTimes(0);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('Invalid character in mention.');
        });
    });

    test('should match snapshot, mention regex error', () => {
        const wrapper = shallow<CreateUserGroupsModal>(
            <CreateUserGroupsModal
                {...baseProps}
            />
        );
        wrapper.setState({name: 'Ursa', mention: 'ursa!/'});
        wrapper.instance().createGroup(users);
        expect(wrapper.instance().props.actions.createGroupWithUserIds).toHaveBeenCalledTimes(0);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('Invalid character in mention.');
        });
    });

    test('should match snapshot, fail to create with empty name', () => {
        const wrapper = shallow<CreateUserGroupsModal>(
            <CreateUserGroupsModal
                {...baseProps}
            />
        );
        wrapper.setState({name: '', mention: 'ursa'});
        wrapper.instance().createGroup(users);
        expect(wrapper.instance().props.actions.createGroupWithUserIds).toHaveBeenCalledTimes(0);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('nameInputErrorText')).toEqual('Name is a required field.');
        });
    });

    test('should match snapshot, fail to create with empty mention', () => {
        const wrapper = shallow<CreateUserGroupsModal>(
            <CreateUserGroupsModal
                {...baseProps}
            />
        );
        wrapper.setState({name: 'Ursa', mention: ''});
        wrapper.instance().createGroup(users);
        expect(wrapper.instance().props.actions.createGroupWithUserIds).toHaveBeenCalledTimes(0);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('Mention is a required field.');
        });
    });

    test('should match snapshot, should create when mention begins with @', () => {
        const wrapper = shallow<CreateUserGroupsModal>(
            <CreateUserGroupsModal
                {...baseProps}
            />
        );
        wrapper.setState({name: 'Ursa', mention: '@ursa', usersToAdd: users});
        wrapper.instance().createGroup(users);
        expect(wrapper.instance().props.actions.createGroupWithUserIds).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('');
            expect(wrapper.state('nameInputErrorText')).toEqual('');
        });
    });
});