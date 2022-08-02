// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, select, boolean} from '@storybook/addon-knobs';

import TeamIcon from './team_icon';
const hoverKnob = () => boolean('With Hover', false);
const sizeKnob = () => select('Size', ['sm', 'lg']);

storiesOf('Widgets/Team Icon', module).
    addDecorator(withKnobs).
    add(
        'initials',
        () => {
            return (
                <TeamIcon
                    content='Team A'
                    withHover={hoverKnob()}
                    size={sizeKnob()}
                />
            );
        },
    ).add(
        'logo',
        () => {
            return (
                <TeamIcon
                    url='https://mattermost.com/wp-content/themes/mattermostv3/favicon-32x32.png'
                    content='Team B'
                    withHover={hoverKnob()}
                    size={sizeKnob()}
                />
            );
        },
    );
