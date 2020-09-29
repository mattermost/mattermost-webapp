// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {shallow} from 'enzyme';

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
    type Props = ComponentProps<typeof ThreadItem>;
    let actions: Props['actions'];

    beforeEach(() => {
        actions = {
            select: jest.fn(),
            follow: jest.fn(),
            unfollow: jest.fn(),
            openInChannel: jest.fn(),
            markRead: jest.fn(),
            markUnread: jest.fn(),
            save: jest.fn(),
            unsave: jest.fn(),
            copyLink: jest.fn(),
        };
    });

    test('should match snapshot', () => {
        const wrapper = shallow<typeof ThreadItem>(
            <ThreadItem
                name={'Johnny Depp'}
                teamName={'Enterprise Team'}
                previewText={'Lobortis phasellus feugiat vivamus facilisis ac suspendisse elit orci augue, metus hac libero cum diam accumsan magnis.'}
                participants={users}
                totalReplies={9}
                newReplies={2}
                newMentions={1}
                lastReplyAt={new Date('2020-09-29T02:30:15.701Z')}

                isFollowing={true}
                isSaved={false}
                isSelected={false}

                actions={actions}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
