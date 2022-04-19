// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import StoryGrid from 'storybook/story_grid';
import StoryBox from 'storybook/story_box';

import Avatar from './avatar';

storiesOf('Widgets/Users Info', module).
    addDecorator(withKnobs).
    add('avatar, per size', () => {
        const sizes: Array<ComponentProps<typeof Avatar>['size']> = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
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
    });
