// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {text, withKnobs} from '@storybook/addon-knobs';

import BasicSeparator from './basic-separator';
import NotificationSeparator from './notification-separator';

storiesOf('Widgets/Separator', module).
    addDecorator(withKnobs).
    add(
        'basic separator without text',
        () => {
            return (<BasicSeparator/>);
        },
    ).add(
        'basic separator with text',
        () => {
            return (<BasicSeparator>{text('Text', 'Some text')}</BasicSeparator>);
        },
    ).add(
        'notification separator with text',
        () => {
            return (
                <NotificationSeparator>
                    {text('Text', 'Some text')}
                </NotificationSeparator>
            );
        },
    );
