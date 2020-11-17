// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, boolean, number, text, date} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

import StoryGrid from 'storybook/story_grid';
import StoryBox from 'storybook/story_box';

import ThreadItem from './thread_item';

const users = [
    {
        url: './api/v4/users/1/image?_=0',
        username: 'jesus.espino',
        name: 'Jesus Espino',
    },
    {
        url: './api/v4/users/2/image?_=0',
        username: 'johnny.depp',
        name: 'Johnny Depp',
    },
    {
        url: './api/v4/users/3/image?_=0',
        username: 'bilbo.baggins',
        name: 'Bilbo Baggins',
    },
    {
        url: './api/v4/users/4/image?_=0',
        username: 'michael.hall',
        name: 'Anthony Michael Hall',
    },
    {
        url: './api/v4/users/5/image?_=0',
        username: 'kathy.baker',
        name: 'Kathy Baker',
    },
    {
        url: './api/v4/users/6/image?_=0',
        username: 'vincent.price',
        name: 'Vincent Price',
    },
    ...new Array(194).fill({
        url: './api/v4/users/7/image?_=0',
        username: 'alan.arkin',
        name: 'Alan Arkin',
    }),
];

storiesOf('Features/Threading/Global Threads', module).
    addDecorator(withKnobs).
    add('ThreadItem', () => (
        <StoryGrid>
            <StoryBox containerStyle={{width: 600}}>
                <ThreadItem
                    name={text('name', users[0].name)}
                    channelName={text('channelName', 'Enterprise Team')}
                    previewText='Do we have a guideline for what minimum width we should support in the system console? Do we have a guideline for what minimum width we should support in the system console? Do we have a guideline for what minimum width we should support in the system console?'

                    participants={users.slice(0, number('number of named participants (max 200)', 7))}
                    totalParticipants={number('number of total participants (unlimited)', 24)}
                    totalReplies={number('total replies', 8)}
                    newReplies={number('new/unread replies', 3)}
                    newMentions={number('new/unread mentions', 1)}
                    lastReplyAt={date('last reply at')}

                    isFollowing={boolean('is following', true)}
                    isSaved={boolean('is saved', false)}
                    isSelected={boolean('is selected', false)}

                    actions={{
                        select: action('select'),
                        follow: action('follow'),
                        unFollow: action('unfollow'),
                        openInChannel: action('open in channel'),
                        markRead: action('mark as read'),
                        markUnread: action('mark as unread'),
                        save: action('save'),
                        unSave: action('unsave'),
                        copyLink: action('copy link'),
                    }}
                />
            </StoryBox>
        </StoryGrid>
    ));
