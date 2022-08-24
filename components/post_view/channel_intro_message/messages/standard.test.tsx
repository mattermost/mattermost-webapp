// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Channel} from '@mattermost/types/channels';

import StandardIntroMessage from './standard';

describe('components/post_view/ChannelIntroMessages', () => {
    const channel = {
        create_at: 1508265709607,
        creator_id: 'creator_id',
        delete_at: 0,
        display_name: 'test channel',
        header: 'test',
        id: 'channel_id',
        last_post_at: 1508265709635,
        name: 'testing',
        purpose: 'test',
        team_id: 'team-id',
        type: 'O',
        update_at: 1508265709607,
    } as Channel;

    // type PluginComponent
    const boardComponent = {
        id: 'board',
        pluginId: 'board',
    };

    const baseProps = {
        currentUserId: 'test-user-id',
        channel,
        fullWidth: true,
        locale: 'en',
        channelProfiles: [],
        enableUserCreation: false,
        teamIsGroupConstrained: false,
        creatorName: 'creatorName',
        stats: {},
        usersLimit: 10,
        actions: {
            getTotalUsersStats: jest.fn().mockResolvedValue([]),
        },
    };

    describe('test Open Channel', () => {
        test('should match snapshot, without boards', () => {
            const wrapper = shallow(
                <StandardIntroMessage{...baseProps}/>,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards', () => {
            const wrapper = shallow(
                <StandardIntroMessage
                    {...baseProps}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
