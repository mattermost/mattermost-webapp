// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GroupRow from './group_row';

describe('admin_console/team_channel_settings/group/GroupRow', () => {
    const testGroup = {
        id: '123',
        display_name: 'DN',
        member_count: 3,
    };
    test('should match snapshot', () => {
        const wrapper = shallow(
            <GroupRow
                group={testGroup}
                removeGroup={() => {}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
