// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import StoryGrid from 'storybook/story_grid';
import StoryBox from 'storybook/story_box';

import Avatar from './avatar';
import Avatars from './avatars';

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
    {
        url: './api/v4/users/7/image?_=0',
        username: 'alan.arkin',
        name: 'Alan Arkin',
    },
];

storiesOf('Widgets/Users Info', module).
    addDecorator(withKnobs).
    add('avatar, per size', () => {
        const sizes: ComponentProps<typeof Avatar>['size'][] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
        const url = text('Image url', './api/v4/users/1/image?_=0');
        const username = text('Username', 'jesus.espino');
        return (
            <StoryGrid>
                {sizes.map((size) => (
                    <StoryBox
                        key={size}
                        label={`size: ${size}`}
                    >

                        <Avatar
                            size={size}
                            username={username}
                            url={url}
                        />
                    </StoryBox>
                ))}
            </StoryGrid>
        );
    }).
    add('avatars, per size', () => {
        const sizes: ComponentProps<typeof Avatar>['size'][] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
        return (
            <StoryGrid>
                {sizes.map((size) => (
                    <StoryBox
                        key={size}
                        label={`size: ${size}`}
                    >
                        <Avatars
                            size={size}
                            users={users}
                        />
                    </StoryBox>

                ))}
            </StoryGrid>
        );
    });
