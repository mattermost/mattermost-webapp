// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import StoryGrid from 'storybook/story_grid';
import StoryBox from 'storybook/story_box';

import Avatars from './avatars';
import ThreadFooter from './thread_footer';

const staticProps = {
    users: [
        {
            url: text('Image 1 url', '/api/v4/users/1/image?_=0'),
            username: text('Username 1', 'johnny.depp'),
            name: text('Fullname 1', 'Johnny Depp'),
        },
        {
            url: text('Image 2 url', '/api/v4/users/2/image?_=0'),
            username: text('Username 2', 'winona.ryder'),
            name: text('Fullname 2', 'Winona Ryder'),
        },
        {
            url: text('Image 3 url', '/api/v4/users/3/image?_=0'),
            username: text('Username 3', 'dianne.wiest'),
            name: text('Fullname 3', 'Dianne Wiest'),
        },
        {
            url: text('Image 4 url', '/api/v4/users/4/image?_=0'),
            username: text('Username 4', 'michael.hall'),
            name: text('Fullname 4', 'Anthony Michael Hall'),
        },
        {
            url: text('Image 5 url', '/api/v4/users/5/image?_=0'),
            username: text('Username  5', 'kathy.baker'),
            name: text('Fullname 5', 'Kathy Baker'),
        },
        {
            url: text('Image 6 url', '/api/v4/users/6/image?_=0'),
            username: text('Username 6', 'vincent.price'),
            name: text('Fullname 6', 'Vincent Price'),
        },
        {
            url: text('Image 7 url', '/api/v4/users/7/image?_=0'),
            username: text('Username 7', 'alan.arkin'),
            name: text('Fullname 7', 'Alan Arkin'),
        },
    ],
};

storiesOf('Thread View', module).
    addDecorator(withKnobs).
    add('Avatars, per size', () => (
        <StoryGrid>
            {['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map((size) => (
                <StoryBox label={`size: ${size}`}>
                    <Avatars
                        size={size}
                        users={staticProps.users}
                    />
                </StoryBox>

            ))}
        </StoryGrid>
    )).
    add('ThreadFooter', () => (
        <StoryGrid>
            <StoryBox label='default'>
                <ThreadFooter
                    repliers={staticProps.users}
                    totalReplies={42}
                    newReplies={5}
                    isFollowing={false}
                    lastReplyAt={1599838334920}
                />
            </StoryBox>
        </StoryGrid>
    ));
