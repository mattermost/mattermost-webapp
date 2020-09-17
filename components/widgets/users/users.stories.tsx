// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import Avatar from './avatar';

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
    borderRadius: '3px 0 3px',
};

storiesOf('Users Info', module).
    addDecorator(withKnobs).
    add('avatar, per size', () => {
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
    });
