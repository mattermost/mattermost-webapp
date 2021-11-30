// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';
import UpdateUserGroupModal from './update_user_group_modal';
import {UserProfile} from 'mattermost-redux/types/users';

import {Value} from 'components/multiselect/multiselect';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

type UserProfileValue = Value & UserProfile;

describe('component/update_user_group_modal', () => {
    const baseProps = {
        onExited: jest.fn(),
        groupId: 'groupid123',
        group: {
            id: 'groupid123',
            name: `group`,
            display_name: `Group Name`,
            description: `Group description`,
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
            />
        );
        expect(wrapper).toMatchSnapshot();
    });


    test('should match snapshot, update group', () => {
        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
            />
        );
        wrapper.setState({name: 'Ursa', mention: 'ursa'});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('');
        });
    });

    test('should match snapshot, mention regex error', () => {
        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
            />
        );
        wrapper.setState({name: 'Ursa', mention: 'ursa!/'});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(0);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('Invalid character in mention.');
        });
    });

    test('should match snapshot, fail to create with empty name', () => {
        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
            />
        );
        wrapper.setState({name: '', mention: 'ursa'});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(0);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('nameInputErrorText')).toEqual('Name is a required field.');
        });
    });

    test('should match snapshot, fail to create with empty mention', () => {
        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
            />
        );
        wrapper.setState({name: 'Ursa', mention: ''});
        wrapper.instance().patchGroup();
        expect(wrapper.instance().props.actions.patchGroup).toHaveBeenCalledTimes(0);
        process.nextTick(() => {
            expect(wrapper.state('showUnknownError')).toEqual(false);
            expect(wrapper.state('mentionInputErrorText')).toEqual('Mention is a required field.');
        });
    });

    test('should match snapshot, should create when mention begins with @', () => {
        const wrapper = shallow<UpdateUserGroupModal>(
            <UpdateUserGroupModal
                {...baseProps}
            />
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
    
});