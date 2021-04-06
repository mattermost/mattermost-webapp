// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, boolean, number, date} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

import StoryGrid from 'storybook/story_grid';
import StoryBox from 'storybook/story_box';

import ThreadFooter from './thread_footer';

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

storiesOf('Features/Threading/Channel Threads', module).
    addDecorator(withKnobs).
    add('ThreadFooter', () => (
        <StoryGrid>
            <StoryBox>
                <ThreadFooter
                    participants={users.slice(0, number('number of named participants (max 200)', 7))}
                    totalParticipants={number('number of total participants (unlimited)', 24)}
                    totalReplies={number('total replies', 8)}
                    newReplies={number('new/unread replies', 3)}
                    lastReplyAt={date('last reply at')}
                    isFollowing={boolean('is following', false)}
                    actions={{
                        follow: action('start following'),
                        unFollow: action('stop following'),
                        openThread: action('open thread'),
                    }}
                />
            </StoryBox>
        </StoryGrid>
    ));
