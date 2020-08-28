// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import Avatar from './avatar';
import ProfilePictures from './profile_pictures';

const containerStyle: CSSProperties = {
    width: 600,
    height: 180,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    alignItems: 'center',
    border: '1px solid #eeeeee',
    borderRadius: 5,
    margin: 10,
};

const labelStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    fontFamily: 'monospace',
    background: '#eee',
    padding: '5px 10px',
    borderRadius: '0 0 3px'
};

storiesOf('Users Info', module).
    addDecorator(withKnobs).
    add('avatar, per size',
        () => {
            const sizes: ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
            const url = text('Image url', '/api/v4/users/1/image?_=0');
            const username = text('Username', 'jesus.espino');
            return (
                <div style={{display: 'flex', width: '100%', flexWrap: 'wrap'}}>
                    {sizes.map((size) => (
                        <div
                            key={size}
                            style={containerStyle}
                        >
                            <span style={labelStyle}>{'size: ' + size}</span>
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
    ).
    add(
        'ProfilePictures, per size',
        () => {
            return (
                <div style={{display: 'flex', width: '100%', flexWrap: 'wrap'}}>
                    {['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map((size) => (
                        <div
                            key={size}
                            style={containerStyle}
                        >
                            <span style={labelStyle}>{'size: ' + size}</span>
                            <ProfilePictures
                                size={size}
                                users={[
                                    {
                                        src: text('Image 1 url', '/api/v4/users/1/image?_=0'),
                                        userId: '1',
                                        username: text('Username 1', 'johnny.depp'),
                                        name: text('Fullname 1', 'Johnny Depp'),
                                    },
                                    {
                                        src: text('Image 2 url', '/api/v4/users/2/image?_=0'),
                                        userId: '2',
                                        username: text('Username 2', 'winona.ryder'),
                                        name: text('Fullname 2', 'Winona Ryder'),
                                    },
                                    {
                                        src: text('Image 3 url', '/api/v4/users/3/image?_=0'),
                                        userId: '3',
                                        username: text('Username 3', 'dianne.wiest'),
                                        name: text('Fullname 3', 'Dianne Wiest'),
                                    },
                                    {
                                        src: text('Image 4 url', '/api/v4/users/4/image?_=0'),
                                        userId: '4',
                                        username: text('Username 4', 'michael.hall'),
                                        name: text('Fullname 4', 'Anthony Michael Hall'),
                                    },
                                    {
                                        src: text('Image 5 url', '/api/v4/users/5/image?_=0'),
                                        userId: '5',
                                        username: text('Username  5', 'kathy.baker'),
                                        name: text('Fullname 5', 'Kathy Baker'),
                                    },
                                    {
                                        src: text('Image 6 url', '/api/v4/users/6/image?_=0'),
                                        userId: '6',
                                        username: text('Username 6', 'vincent.price'),
                                        name: text('Fullname 6', 'Vincent Price'),
                                    },
                                    {
                                        src: text('Image 7 url', '/api/v4/users/7/image?_=0'),
                                        userId: '7',
                                        username: text('Username 7', 'alan.arkin'),
                                        name: text('Fullname 7', 'Alan Arkin'),
                                    },
                                ]}
                            />
                        </div>
                    ))}
                </div>
            );
        },
    );
