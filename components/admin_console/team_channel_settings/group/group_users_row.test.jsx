// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GroupUsersRow from './group_users_row.jsx';

describe('admin_console/team_channel_settings/group/GroupUsersRow', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <GroupUsersRow
                username='test'
                displayName='Test display name'
                email='test@test.com'
                userId='xxxxxxxxxxxxxxxxxxxxxxxxxx'
                lastPictureUpdate={0}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
