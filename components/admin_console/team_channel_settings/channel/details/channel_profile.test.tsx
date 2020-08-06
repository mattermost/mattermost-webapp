// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Team} from 'mattermost-redux/types/teams';
import {Channel} from 'mattermost-redux/types/channels';

import {ChannelProfile} from './channel_profile';

describe('admin_console/team_channel_settings/channel/ChannelProfile', () => {
    test('should match snapshot', () => {
        const testTeam: Partial<Team> = {display_name: 'test'};
        const testChannel: Partial<Channel> = {display_name: 'test'};
        const wrapper = shallow(
            <ChannelProfile
                isArchived={false}
                team={testTeam}
                channel={testChannel}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
