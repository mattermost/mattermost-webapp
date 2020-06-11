// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {ChannelType} from 'mattermost-redux/src/types/channels';

import ChannelList from './channel_list';

describe('admin_console/team_channel_settings/channel/ChannelList', () => {
    test('should match snapshot', () => {
        const testChannels = [{
            id: '123',
            display_name: 'DN',
            create_at: 1,
            update_at: 1,
            delete_at: 0,
            team_id: 'a',
            type: 'O' as ChannelType,
            name: 'abc',
            header: 'abc',
            purpose: 'abc',
            last_post_at: 123,
            total_msg_count: 123,
            extra_update_at: 123,
            creator_id: 'abc',
            scheme_id: 'abc',
            group_constrained: false,
            team_display_name: 'teamDisplayName',
            team_name: 'teamName',
            team_update_at: 1,
        }];

        const actions = {
            getData: jest.fn().mockResolvedValue(testChannels),
            searchAllChannels: jest.fn().mockResolvedValue(testChannels),
        };

        const wrapper = shallow(
            <ChannelList
                data={testChannels}
                total={testChannels.length}
                actions={actions}
            />);

        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with paging', () => {
        const testChannels = [];
        for (let i = 0; i < 30; i++) {
            testChannels.push({
                id: 'id' + i,
                display_name: 'DN' + i,
                create_at: 1,
                update_at: 1,
                delete_at: 0,
                team_id: 'a',
                type: 'O' as ChannelType,
                name: 'abc',
                header: 'abc',
                purpose: 'abc',
                last_post_at: 123,
                total_msg_count: 123,
                extra_update_at: 123,
                creator_id: 'abc',
                scheme_id: 'abc',
                group_constrained: false,
                team_display_name: 'teamDisplayName',
                team_name: 'teamName',
                team_update_at: 1,
            });
        }
        const actions = {
            getData: jest.fn().mockResolvedValue(Promise.resolve(testChannels)),
            searchAllChannels: jest.fn().mockResolvedValue(Promise.resolve(testChannels)),
        };

        const wrapper = shallow(
            <ChannelList
                data={testChannels}
                total={30}
                actions={actions}
            />);
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });
});
