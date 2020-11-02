// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import ChannelHeader from 'components/channel_header/channel_header';
import Markdown from 'components/markdown';
import GuestBadge from 'components/widgets/badges/guest_badge';
import Constants, {RHSStates} from 'utils/constants';

describe('components/ChannelHeader', () => {
    const baseProps = {
        actions: {
            leaveChannel: jest.fn(),
            favoriteChannel: jest.fn(),
            unfavoriteChannel: jest.fn(),
            showFlaggedPosts: jest.fn(),
            showPinnedPosts: jest.fn(),
            showMentions: jest.fn(),
            openRHSSearch: jest.fn(),
            closeRightHandSide: jest.fn(),
            openModal: jest.fn(),
            closeModal: jest.fn(),
            getCustomEmojisInText: jest.fn(),
            updateChannelNotifyProps: jest.fn(),
            goToLastViewedChannel: jest.fn(),
        },
        teamUrl: 'team_url',
        teamId: 'team_id',
        channel: {},
        channelMember: {},
        currentUser: {},
        lastViewedChannelName: '',
        penultimateViewedChannelName: '',
        teammateNameDisplaySetting: '',
        currentRelativeTeamUrl: '',
    };

    const populatedProps = {
        ...baseProps,
        channel: {
            id: 'channel_id',
            team_id: 'team_id',
            name: 'Test',
            delete_at: 0,
        },
        channelMember: {
            channel_id: 'channel_id',
            user_id: 'user_id',
        },
        currentUser: {
            id: 'user_id',
        },
    };

    test('should render properly when empty', () => {
        const wrapper = shallowWithIntl(
            <ChannelHeader {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render properly when populated', () => {
        const wrapper = shallowWithIntl(
            <ChannelHeader {...populatedProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render properly when populated with channel props', () => {
        const props = {
            ...baseProps,
            channel: {
                id: 'channel_id',
                team_id: 'team_id',
                name: 'Test',
                header: 'See ~test',
                props: {
                    channel_mentions: {
                        test: {
                            display_name: 'Test',
                        },
                    },
                },
            },
            channelMember: {
                channel_id: 'channel_id',
                user_id: 'user_id',
            },
            currentUser: {
                id: 'user_id',
            },
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render archived view', () => {
        const props = {
            ...populatedProps,
            channel: {...populatedProps.channel, delete_at: 1234},
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render correct menu when muted', () => {
        const props = {
            ...populatedProps,
            isMuted: true,
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should unmute the channel when mute icon is clicked', () => {
        const props = {
            ...populatedProps,
            isMuted: true,
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );

        wrapper.find('.channel-header__mute').simulate('click');
        wrapper.update();
        expect(props.actions.updateChannelNotifyProps).toHaveBeenCalledTimes(1);
        expect(props.actions.updateChannelNotifyProps).toHaveBeenCalledWith('user_id', 'channel_id', {mark_unread: 'all'});
    });

    test('should render active pinned posts', () => {
        const props = {
            ...populatedProps,
            rhsState: RHSStates.PIN,
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render active flagged posts', () => {
        const props = {
            ...populatedProps,
            rhsState: RHSStates.FLAG,
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render active mentions posts', () => {
        const props = {
            ...populatedProps,
            rhsState: RHSStates.MENTION,
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render bot description', () => {
        const props = {
            ...populatedProps,
            channel: {
                header: 'not the bot description',
                type: Constants.DM_CHANNEL,
            },
            dmUser: {
                id: 'user_id',
                is_bot: true,
                bot_description: 'the bot description',
            },
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );
        expect(wrapper.containsMatchingElement(
            <Markdown
                message={props.currentUser.bot_description}
            />,
        )).toEqual(true);
    });

    test('should render the pinned icon with the pinned posts count', () => {
        const props = {
            ...populatedProps,
            pinnedPostsCount: 2,
        };
        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render the guest badges on gms', () => {
        const props = {
            ...populatedProps,
            channel: {
                header: 'test',
                display_name: 'regular_user, guest_user',
                type: Constants.GM_CHANNEL,
            },
            gmMembers: [
                {
                    id: 'user_id',
                    username: 'regular_user',
                    roles: 'system_user',
                },
                {
                    id: 'guest_id',
                    username: 'guest_user',
                    roles: 'system_guest',
                },
            ],
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );
        expect(wrapper.containsMatchingElement(
            <GuestBadge show={true}/>,
        )).toEqual(true);
    });
});
