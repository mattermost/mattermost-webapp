// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GroupUsersRow from './group_users_row.jsx';

describe('admin_console/team_channel_settings/group/GroupUsersRow', () => {
    const testUser = {
        id: '123',
        username: 'test',
        email: 'test@test.com',
        first_name: 'First',
        last_name: 'Last',
        groups: [{
            id: '123123',
            display_name: 'test group',
        }],
        roles: 'system_user',
    };
    test('should match snapshot', () => {
        const wrapper = shallow(
            <GroupUsersRow
                displayName='Test display name'
                user={testUser}
                lastPictureUpdate={0}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('should match snapshot with two groups', () => {
        const testUser2 = {
            ...testUser,
            groups: [{
                id: '123123',
                display_name: 'test group',
            }, {
                id: '123123',
                display_name: 'test group',
            }],
        };
        const wrapper = shallow(
            <GroupUsersRow
                displayName='Test display name'
                user={testUser2}
                lastPictureUpdate={0}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
