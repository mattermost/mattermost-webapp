// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Group} from 'mattermost-redux/types/groups';
import {Channel} from 'mattermost-redux/types/channels';
import {Team} from 'mattermost-redux/types/teams';

import ChannelDetails from './channel_details';

describe('admin_console/team_channel_settings/channel/ChannelDetails', () => {
    test('should match snapshot', () => {
        const groups: Partial<Group>[] = [{
            id: '123',
            display_name: 'DN',
            member_count: 3,
        }];
        const allGroups = {
            123: groups[0],
        };
        const testChannel: Partial<Channel> & {team_name: string} = {
            id: '123',
            team_name: 'team',
            type: 'O',
            group_constrained: false,
            name: 'DN',
        };
        const team: Partial<Team> = {
            display_name: 'test',
        };

        const actions = {
            getChannel: jest.fn().mockResolvedValue([]),
            getTeam: jest.fn().mockResolvedValue([]),
            linkGroupSyncable: jest.fn(),
            conver: jest.fn(),
            patchChannel: jest.fn(),
            setNavigationBlocked: jest.fn(),
            unlinkGroupSyncable: jest.fn(),
            getGroups: jest.fn().mockResolvedValue([]),
            membersMinusGroupMembers: jest.fn(),
            updateChannelPrivacy: jest.fn(),
            patchGroupSyncable: jest.fn(),
        };

        let wrapper = shallow(
            <ChannelDetails
                groups={groups}
                team={team}
                totalGroups={groups.length}
                actions={actions}
                channel={testChannel}
                channelID={testChannel.id}
                allGroups={allGroups}
            />
        );
        expect(wrapper).toMatchSnapshot();

        wrapper = shallow(
            <ChannelDetails
                groups={groups}
                team={{}}
                totalGroups={groups.length}
                actions={actions}
                channel={testChannel}
                channelID={testChannel.id}
                allGroups={allGroups}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
