// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamDetails from './team_details.jsx';

describe('admin_console/team_channel_settings/team/TeamDetails', () => {
    test('should match snapshot', () => {
        const groups = [{
            id: '123',
            display_name: 'DN',
            member_count: 3,
        }];
        const allGroups = {
            123: groups[0],
        };
        const testTeam = {
            id: '123',
            allow_open_invite: false,
            allowed_domains: '',
            group_constrained: false,
            display_name: 'team',
        };
        const wrapper = shallow(
            <TeamDetails
                groups={groups}
                totalGroups={groups.length}
                actions={{
                    getTeam: jest.fn().mockResolvedValue([]),
                    linkGroupSyncable: jest.fn(),
                    patchTeam: jest.fn(),
                    setNavigationBlocked: jest.fn(),
                    unlinkGroupSyncable: jest.fn(),
                    getGroups: jest.fn().mockResolvedValue([]),
                    membersMinusGroupMembers: jest.fn(),
                    patchGroupSyncable: jest.fn(),
                    addUserToTeam: jest.fn(),
                    removeUserFromTeam: jest.fn(),
                    updateTeamMemberSchemeRoles: jest.fn(),
                }}
                team={testTeam}
                teamID={testTeam.id}
                allGroups={allGroups}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
