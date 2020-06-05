// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {ChannelType} from 'mattermost-redux/types/channels';

import ChannelRow from './channel_row';

describe('admin_console/team_channel_settings/channel/ChannelRow', () => {
    const testChannel = {
        id: 'C123',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        team_id: 'T123',
        type: 'D' as ChannelType,
        display_name: 'Channel Display Name',
        name: 'DN',
        header: '123',
        purpose: '123',
        last_post_at: 0,
        total_msg_count: 0,
        extra_update_at: 0,
        creator_id: '123',
        scheme_id: '123',
        group_constrained: false,
        team_display_name: 'Team Display Name',
        team_name: 'Team Name',
        team_update_at: 0,
    };
    test('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelRow
                onRowClick={jest.fn()}
                channel={testChannel}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
