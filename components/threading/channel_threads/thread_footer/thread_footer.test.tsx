// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {mount} from 'enzyme';

import SimpleTooltip from 'components/widgets/simple_tooltip';

import Timestamp from 'components/timestamp';
import Avatars from 'components/widgets/users/avatars';
import FollowButton from '../../common/follow_button';

import {mockStore} from 'tests/test_store';

import {UserThread} from 'mattermost-redux/types/threads';

import ThreadFooter from './thread_footer';

describe('components/threading/channel_threads/thread_footer', () => {
    const baseState = {
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
            posts: {
                posts: {
                    postthreadid: {
                        id: 'postthreadid',
                        reply_count: 9,
                        last_reply_at: 1554161504000,
                        is_following: true,
                        channel_id: 'cid',
                        user_id: '1',
                    },
                },
            },

            threads: {
                threads: {
                    postthreadid: {
                        id: 'postthreadid',
                        participants: [
                            {id: '1'},
                            {id: '2'},
                            {id: '3'},
                            {id: '4'},
                            {id: '5'},
                        ],
                        reply_count: 9,
                        unread_replies: 0,
                        unread_mentions: 0,
                        last_reply_at: 1554161504000,
                        last_viewed_at: 1554161505000,
                        is_following: true,
                        post: {
                            channel_id: 'cid',
                            user_id: '1',
                        },
                    },
                },
            },
        },
    };

    let state: any;
    let thread: UserThread;
    let props: ComponentProps<typeof ThreadFooter>;

    beforeEach(() => {
        state = {...baseState};
        thread = state.entities.threads.threads.postthreadid;
        props = {threadId: thread.id};
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
        thread.unread_replies = 2;

        const {mountOptions} = mockStore(state);
        const wrapper = mount(
            <ThreadFooter
                {...props}
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
        expect(wrapper.find(Avatars).props()).toHaveProperty('userIds', ['2', '3', '4', '5']);
    });

    test('should have a timestamp', () => {
        const {mountOptions} = mockStore(state);
        const wrapper = mount(
            <ThreadFooter
                {...props}
            />,
            mountOptions,
        );
        expect(wrapper.find(Timestamp).props()).toHaveProperty('value', thread.last_reply_at);
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
    });

    test('should have a follow button', () => {
        thread.is_following = false;

        const {mountOptions} = mockStore(state);
        const wrapper = mount(
            <ThreadFooter
                {...props}
            />,
            mountOptions,
        );

        expect(wrapper.exists(FollowButton)).toBe(true);
        expect(wrapper.find(FollowButton).props()).toHaveProperty('isFollowing', thread.is_following);
        wrapper.find('button.separated').last().simulate('click');
    });

    test('should have an unfollow button', () => {
        thread.is_following = true;
        const {mountOptions} = mockStore(state);

        const wrapper = mount(
            <ThreadFooter
                {...props}
            />,
            mountOptions,
        );
        expect(wrapper.exists(FollowButton)).toBe(true);

        expect(wrapper.find(FollowButton).props()).toHaveProperty('isFollowing', thread.is_following);

        wrapper.find('button.separated').last().simulate('click');
    });
});
