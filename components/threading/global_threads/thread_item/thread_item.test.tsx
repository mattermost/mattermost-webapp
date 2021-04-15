// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {shallow} from 'enzyme';

import {set} from 'lodash';

import {UserThread} from 'mattermost-redux/types/threads';

import ThreadMenu from '../thread_menu';
import Badge from 'components/widgets/badges/badge';

import {GlobalState} from 'types/store';

import ThreadItem from './thread_item';

const mockRouting = {
    currentUserId: '7n4ach3i53bbmj84dfmu5b7c1c',
    currentTeamId: 'tid',
    goToInChannel: jest.fn(),
    select: jest.fn(),
};
jest.mock('../../hooks', () => {
    return {
        useThreadRouting: () => mockRouting,
    };
});

const mockDispatch = jest.fn();
let mockState: GlobalState;
let mockThread: UserThread;

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));

describe('components/threading/global_threads/thread_item', () => {
    let props: ComponentProps<typeof ThreadItem>;

    beforeEach(() => {
        mockThread = {
            id: '1y8hpek81byspd4enyk9mp1ncw',
            reply_count: 0,
            unread_replies: 0,
            unread_mentions: 0,
            is_following: true,
            participants: [
                {
                    id: '7n4ach3i53bbmj84dfmu5b7c1c',
                    username: 'frodo.baggins',
                    first_name: 'Frodo',
                    last_name: 'Baggins',
                },
                {
                    id: 'ij61jet1bbdk8fhhxitywdj4ih',
                    username: 'samwise.gamgee',
                    first_name: 'Samwise',
                    last_name: 'Gamgee',
                },
            ],
            post: {
                user_id: 'mt5td9mdriyapmwuh5pc84dmhr',
                channel_id: 'pnzsh7kwt7rmzgj8yb479sc9yw',
            },
        } as UserThread;

        props = {
            threadId: mockThread.id,
            isSelected: false,
        };

        mockState = {} as GlobalState;
        set(mockState, 'entities.general.config', {});
        set(mockState, 'entities.preferences.myPreferences', {});
        set(mockState, 'entities.teams.currentTeamId', 'tid');
        set(mockState, 'entities.users', {
            currentUserId: '7n4ach3i53bbmj84dfmu5b7c1c',
            profiles: {
                '7n4ach3i53bbmj84dfmu5b7c1c': {
                    id: '7n4ach3i53bbmj84dfmu5b7c1c',
                    username: 'frodo.baggins',
                    first_name: 'Frodo',
                    last_name: 'Baggins',
                },
                ij61jet1bbdk8fhhxitywdj4ih: {
                    username: 'samwise.gamgee',
                    first_name: 'Samwise',
                    last_name: 'Gamgee',
                },
            },
        });

        set(mockState, 'entities.posts.posts', {
            '1y8hpek81byspd4enyk9mp1ncw': {
                id: '1y8hpek81byspd4enyk9mp1ncw',
                user_id: 'mt5td9mdriyapmwuh5pc84dmhr',
                channel_id: 'pnzsh7kwt7rmzgj8yb479sc9yw',
                message: 'test msg',
                create_at: 1610486901110,
                edit_at: 1611786714912,
            },
        });
        set(mockState, 'entities.channels.channels', {
            pnzsh7kwt7rmzgj8yb479sc9yw: {
                id: 'pnzsh7kwt7rmzgj8yb479sc9yw',
                name: 'test-team',
                display_name: 'Team name',
            },
        });
        set(mockState, 'entities.threads', {
            threads: {
                '1y8hpek81byspd4enyk9mp1ncw': mockThread,
            },
            threadsInTeam: {
                tid: ['1y8hpek81byspd4enyk9mp1ncw'],
            },
        });
    });

    test('should report total number of replies', () => {
        mockThread.reply_count = 9;
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
        mockThread.reply_count = 11;
        mockThread.unread_replies = 2;

        const wrapper = shallow(
            <ThreadItem
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.exists('.dot-unreads')).toBe(true);
        expect(wrapper.find('.activity FormattedMessage').props()).toHaveProperty('id', 'threading.numNewReplies');
        expect(wrapper.find('.activity FormattedMessage').props()).toHaveProperty('values.newReplies', 2);
    });

    test('should report unread mentions', () => {
        mockThread.reply_count = 16;
        mockThread.unread_replies = 5;
        mockThread.unread_mentions = 2;

        const wrapper = shallow(
            <ThreadItem
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.dot-mentions').text()).toBe('2');
        expect(wrapper.find('.activity FormattedMessage').props()).toHaveProperty('id', 'threading.numNewReplies');
        expect(wrapper.find('.activity FormattedMessage').props()).toHaveProperty('values.newReplies', 5);
    });

    test('should show channel name', () => {
        const wrapper = shallow(
            <ThreadItem
                {...props}
            />,
        );
        expect(wrapper.find(Badge).childAt(0).text()).toContain('Team name');
    });

    test('should pass required props to ThreadMenu', () => {
        const wrapper = shallow(
            <ThreadItem
                {...props}
            />,
        );

        // verify ThreadMenu received transient/required props
        new Map<string, any>([
            ['hasUnreads', Boolean(mockThread.unread_replies)],
            ['threadId', mockThread.id],
            ['isFollowing', mockThread.is_following],
            ['unreadTimestamp', 1611786714912],
        ]).forEach((val, prop) => {
            expect(wrapper.find(ThreadMenu).props()).toHaveProperty(prop, val);
        });
    });
});

