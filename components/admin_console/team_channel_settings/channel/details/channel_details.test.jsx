// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelDetails from './channel_details.jsx';

describe('admin_console/team_channel_settings/channel/ChannelDetails', () => {
    test('should match snapshot', () => {
        const groups = [{
            id: '123',
            display_name: 'DN',
            member_count: 3,
        }];
        const allGroups = {
            123: groups[0],
        };
        const testChannel = {
            id: '123',
            team_name: 'team',
            type: 'O',
            group_constrained: false,
            name: 'DN',
        };
        const team = {
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
