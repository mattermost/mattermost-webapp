// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';
import {UserProfile} from '@mattermost/types/users';

import {Channel, ChannelType} from '@mattermost/types/channels';

import {TestHelper} from 'utils/test_helper';

import ChannelIntroMessage from './channel_intro_message';

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

    const user1 = {id: 'user1', roles: 'system_user'};
    const users = [
        {id: 'user1', roles: 'system_user'},
        {id: 'guest1', roles: 'system_guest'},
    ] as UserProfile[];

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
        isFavorite: false,
        isInvitingPeople: false,
        isNotificationsOpen: false,
        isSetHeaderOpen: false,
        isMobileView: false,
        currentUser: TestHelper.getUserMock({id: 'id1'}),
        actions: {
            getTotalUsersStats: jest.fn().mockResolvedValue([]),
            favoriteChannel: jest.fn().mockResolvedValue([]),
            unfavoriteChannel: jest.fn().mockResolvedValue([]),
        },
    };

    describe('test Open Channel', () => {
        test('should match snapshot, without boards', () => {
            const wrapper = shallow(
                <ChannelIntroMessage{...baseProps}/>,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...baseProps}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('test Group Channel', () => {
        const groupChannel = {
            ...channel,
            type: Constants.GM_CHANNEL as ChannelType,
        };
        const props = {
            ...baseProps,
            channel: groupChannel,
        };

        test('should match snapshot, no profiles', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with profiles, without boards', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    channelProfiles={users}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with profiles, with boards', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    channelProfiles={users}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('test DIRECT Channel', () => {
        const directChannel = {
            ...channel,
            type: Constants.DM_CHANNEL as ChannelType,
        };
        const props = {
            ...baseProps,
            channel: directChannel,
        };

        test('should match snapshot, without teammate', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with teammate, without boards', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    teammate={user1 as UserProfile}
                    teammateName='my teammate'
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with teammate, with boards', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    teammate={user1 as UserProfile}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('test DEFAULT Channel', () => {
        const directChannel = {
            ...channel,
            name: Constants.DEFAULT_CHANNEL,
            type: Constants.OPEN_CHANNEL as ChannelType,
        };
        const props = {
            ...baseProps,
            channel: directChannel,
        };

        test('should match snapshot, readonly', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    isReadOnly={true}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, no boards', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    teamIsGroupConstrained={true}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    teamIsGroupConstrained={true}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards. enableUserCreation', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    enableUserCreation={true}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards, enable, group constrained', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    enableUserCreation={true}
                    teamIsGroupConstrained={true}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('test OFFTOPIC Channel', () => {
        const directChannel = {
            ...channel,
            type: Constants.OPEN_CHANNEL as ChannelType,
            name: Constants.OFFTOPIC_CHANNEL,
        };
        const props = {
            ...baseProps,
            channel: directChannel,
        };

        test('should match snapshot, without boards', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
