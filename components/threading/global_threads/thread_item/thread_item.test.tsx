// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {shallow} from 'enzyme';

import ThreadMenu from '../thread_menu';
import Badge from 'components/widgets/badges/badge';

import Avatars from 'components/widgets/users/avatars';

import ThreadItem from './thread_item';
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

describe('components/threading/global_threads/thread_item', () => {
    let props: ComponentProps<typeof ThreadItem>;

    beforeEach(() => {
        props = {
            name: 'Johnny Depp',
            channelName: 'Enterprise Team',
            previewText: 'Lobortis phasellus feugiat vivamus facilisis ac suspendisse elit orci augue, metus hac libero cum diam accumsan magnis.',
            participants: users,
            totalReplies: 9,
            newReplies: 0,
            newMentions: 0,
            lastReplyAt: new Date('2020-09-29T02:30:15.701Z'),
            isFollowing: true,
            isSaved: false,
            isSelected: false,
            actions: {
                select: jest.fn(),
                follow: jest.fn(),
                unFollow: jest.fn(),
                openInChannel: jest.fn(),
                markRead: jest.fn(),
                markUnread: jest.fn(),
                save: jest.fn(),
                unSave: jest.fn(),
                copyLink: jest.fn(),
            },
        };
    });

    test('should report total number of replies', () => {
        const wrapper = shallow(
            <ThreadItem
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.activity FormattedMessage').props()).toHaveProperty('id', 'threading.numReplies');
        expect(wrapper.find('.activity FormattedMessage').props()).toHaveProperty('values.totalReplies', 9);
    });

    test('should report unread messages', () => {
        const wrapper = shallow(
            <ThreadItem
                {...props}
                newReplies={2}
            />,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.exists('.dot-unreads')).toBe(true);
        expect(wrapper.find('.activity FormattedMessage').props()).toHaveProperty('id', 'threading.numNewReplies');
        expect(wrapper.find('.activity FormattedMessage').props()).toHaveProperty('values.newReplies', 2);
    });

    test('should report unread mentions', () => {
        const wrapper = shallow(
            <ThreadItem
                {...props}
                newReplies={2}
                newMentions={1}
            />,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.dot-mentions').text()).toBe('1');
        expect(wrapper.find('.activity FormattedMessage').props()).toHaveProperty('id', 'threading.numNewReplies');
        expect(wrapper.find('.activity FormattedMessage').props()).toHaveProperty('values.newReplies', 2);
    });

    test('should show channel name (if provided)', () => {
        const wrapper = shallow(
            <ThreadItem
                {...props}
                newReplies={2}
                newMentions={1}
            />,
        );
        expect(wrapper.find(Badge).childAt(0).text()).toContain(props.channelName);
        wrapper.setProps({channelName: ''});
        expect(wrapper.exists(Badge)).toBe(false);
    });

    test('should pass required props to ThreadMenu', () => {
        const wrapper = shallow(
            <ThreadItem
                {...props}
            />,
        );
        const {actions} = props;

        // verify ThreadMenu received transient/required props
        new Map<string, any>([
            ['hasUnreads', expect.any(Boolean)],
            ['isFollowing', props.isFollowing],
            ['isSaved', props.isSaved],
            ['actions.follow', actions.follow],
            ['actions.unFollow', actions.unFollow],
            ['actions.openInChannel', actions.openInChannel],
            ['actions.markRead', actions.markRead],
            ['actions.markUnread', actions.markUnread],
            ['actions.save', actions.save],
            ['actions.unSave', actions.unSave],
            ['actions.copyLink', actions.copyLink],
        ]).forEach((val, prop) => {
            expect(wrapper.find(ThreadMenu).props()).toHaveProperty(prop, val);
        });
    });

    test('should pass required props to Avatars', () => {
        const wrapper = shallow(
            <ThreadItem
                {...props}
            />,
        );

        expect(wrapper.find(Avatars).props()).toHaveProperty('users', props.participants);
    });
});

