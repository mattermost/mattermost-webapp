// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {shallow} from 'enzyme';

import SimpleTooltip from 'components/widgets/simple_tooltip';

import Timestamp from 'components/timestamp';
import Avatars from 'components/widgets/users/avatars';
import FollowButton from '../../common/follow_button';
import Button from '../../common/button';

import ThreadFooter from './thread_footer';

const users = [
    {
        url: 'test-url-1',
        username: 'johnny.depp',
        name: 'Johnny Depp',
    },
    {
        url: 'test-url-2',
        username: 'bilbo.baggins',
        name: 'Bilbo Baggins',
    },
    {
        url: 'test-url-3',
        username: 'michael.hall',
        name: 'Anthony Michael Hall',
    },
    {
        url: 'test-url-4',
        username: 'kathy.baker',
        name: 'Kathy Baker',
    },
    {
        url: 'test-url-5',
        username: 'vincent.price',
        name: 'Vincent Price',
    },
    {
        url: 'test-url-6',
        username: 'alan.arkin',
        name: 'Alan Arkin',
    },
];

describe('components/threading/channel_threads/thread_footer', () => {
    let props: ComponentProps<typeof ThreadFooter>;

    beforeEach(() => {
        props = {
            participants: users,
            totalReplies: 9,
            newReplies: 0,
            lastReplyAt: new Date('2020-09-29T02:30:15.701Z'),
            isFollowing: true,
            actions: {
                follow: jest.fn(),
                unFollow: jest.fn(),
                openThread: jest.fn(),
            },
        };
    });

    test('should report total number of replies', () => {
        const wrapper = shallow(
            <ThreadFooter
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.exists('.dot-unreads')).toBe(false);
        expect(wrapper.exists('FormattedMessage[id="threading.numReplies"]')).toBe(true);
    });

    test('should show unread indicator', () => {
        const wrapper = shallow(
            <ThreadFooter
                {...props}
                newReplies={2}
            />,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(SimpleTooltip).find('.dot-unreads').exists()).toBe(true);
    });

    test('should should have avatars', () => {
        const wrapper = shallow(
            <ThreadFooter
                {...props}
            />,
        );
        expect(wrapper.find(Avatars).props()).toHaveProperty('users', props.participants);
    });

    test('should have a timestamp', () => {
        const wrapper = shallow(
            <ThreadFooter
                {...props}
            />,
        );
        expect(wrapper.find(Timestamp).props()).toHaveProperty('value', props.lastReplyAt);
    });

    test('should have a reply button', () => {
        const wrapper = shallow(
            <ThreadFooter
                {...props}
            />,
        );
        wrapper.find(Button).simulate('click');
        expect(props.actions.openThread).toHaveBeenCalled();
    });

    test('should have a follow button', () => {
        const wrapper = shallow(
            <ThreadFooter
                {...props}
            />,
        );
        expect(wrapper.exists(FollowButton)).toBe(true);

        expect(wrapper.find(FollowButton).props()).toHaveProperty('isFollowing', props.isFollowing);

        wrapper.find(FollowButton).props().follow({} as any);
        expect(props.actions.follow).toHaveBeenCalled();

        wrapper.find(FollowButton).props().unFollow({} as any);
        expect(props.actions.unFollow).toHaveBeenCalled();
    });
});
