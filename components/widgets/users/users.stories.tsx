// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import Avatar from './avatar';

storiesOf('Users Info', module).
    addDecorator(withKnobs).
    add(
        'avatars per size',
        () => {
            const sizes: ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
            const url = text('Image url', '/api/v4/users/1/image?_=0');
            const username = text('Username', 'jesus.espino');
            return (
                <div style={{display: 'flex', width: '100%', flexWrap: 'wrap'}}>
                    {sizes.map((size) => (
                        <div
                            key={size}
                            style={{width: 180, height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid #eeeeee', borderRadius: 5, margin: 10}}
                        >
                            <strong>{'size: ' + size}</strong>
                            <Avatar
                                size={size}
                                username={username}
                                url={url}
                            />
                        </div>
                    ))}
                </div>
            );
        }
    );
