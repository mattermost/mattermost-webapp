// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {mount} from 'enzyme';

import SimpleTooltip from 'components/widgets/simple_tooltip';

import Timestamp from 'components/timestamp';
import Avatars from 'components/widgets/users/avatars';
import FollowButton from '../../common/follow_button';

import {mockStore} from 'tests/test_store';

import ThreadFooter from './thread_footer';

describe('components/threading/channel_threads/thread_footer', () => {
    const state = {
        entities: {
            general: {
                config: {},
            },
            users: {
                currentUserId: 'uid',
                profiles: {
                    1: {
                        id: '1',
                        username: 'first.last1',
                        nickname: 'nickname1',
                        first_name: 'First1',
                        last_name: 'Last1',
                    },
                    2: {
                        id: '2',
                        username: 'first.last2',
                        nickname: 'nickname2',
                        first_name: 'First2',
                        last_name: 'Last2',
                    },
                    3: {
                        id: '3',
                        username: 'first.last3',
                        nickname: 'nickname3',
                        first_name: 'First3',
                        last_name: 'Last3',
                    },
                    4: {
                        id: '4',
                        username: 'first.last4',
                        nickname: 'nickname4',
                        first_name: 'First4',
                        last_name: 'Last4',
                    },
                    5: {
                        id: '5',
                        username: 'first.last5',
                        nickname: 'nickname5',
                        first_name: 'First5',
                        last_name: 'Last5',
                    },
                },
            },
            teams: {
                currentTeamId: 'tid',
            },
            preferences: {
                myPreferences: {},
            },
        },
    };

    let props: ComponentProps<typeof ThreadFooter>;

    beforeEach(() => {
        props = {
            participants: [
                {id: '1'},
                {id: '2'},
                {id: '3'},
                {id: '4'},
                {id: '5'},
            ],
            totalReplies: 9,
            newReplies: 0,
            lastReplyAt: new Date('2020-09-29T02:30:15.701Z'),
            isFollowing: true,
            actions: {
                setFollowing: jest.fn(),
                openThread: jest.fn(),
            },
        };
    });

    test('should report total number of replies', () => {
        const {mountOptions} = mockStore(state);

        const wrapper = mount(
            <ThreadFooter
                {...props}
            />,
            mountOptions,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.exists('.dot-unreads')).toBe(false);
        expect(wrapper.exists('FormattedMessage[id="threading.numReplies"]')).toBe(true);
    });

    test('should show unread indicator', () => {
        const {mountOptions} = mockStore(state);
        const wrapper = mount(
            <ThreadFooter
                {...props}
                newReplies={2}
            />,
            mountOptions,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(SimpleTooltip).find('.dot-unreads').exists()).toBe(true);
    });

    test('should should have avatars', () => {
        const {mountOptions} = mockStore(state);
        const wrapper = mount(
            <ThreadFooter
                {...props}
            />,
            mountOptions,
        );
        expect(wrapper.find(Avatars).props()).toHaveProperty('userIds', props.participants.map(({id}) => id));
    });

    test('should have a timestamp', () => {
        const {mountOptions} = mockStore(state);
        const wrapper = mount(
            <ThreadFooter
                {...props}
            />,
            mountOptions,
        );
        expect(wrapper.find(Timestamp).props()).toHaveProperty('value', props.lastReplyAt);
    });

    test('should have a reply button', () => {
        const {mountOptions} = mockStore(state);
        const wrapper = mount(
            <ThreadFooter
                {...props}
            />,
            mountOptions,
        );
        wrapper.find('button.separated').first().simulate('click');
        expect(props.actions.openThread).toHaveBeenCalled();
    });

    test('should have a follow button', () => {
        const {mountOptions} = mockStore(state);
        props.isFollowing = false;

        const wrapper = mount(
            <ThreadFooter
                {...props}
            />,
            mountOptions,
        );
        expect(wrapper.exists(FollowButton)).toBe(true);

        expect(wrapper.find(FollowButton).props()).toHaveProperty('isFollowing', props.isFollowing);

        wrapper.find('button.separated').last().simulate('click');
        expect(props.actions.setFollowing).toHaveBeenCalledWith(true);
    });

    test('should have an unfollow button', () => {
        const {mountOptions} = mockStore(state);
        props.isFollowing = true;

        const wrapper = mount(
            <ThreadFooter
                {...props}
            />,
            mountOptions,
        );
        expect(wrapper.exists(FollowButton)).toBe(true);

        expect(wrapper.find(FollowButton).props()).toHaveProperty('isFollowing', props.isFollowing);

        wrapper.find('button.separated').last().simulate('click');
        expect(props.actions.setFollowing).toHaveBeenCalledWith(false);
    });
});
