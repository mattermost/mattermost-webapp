// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {text, withKnobs} from '@storybook/addon-knobs';

import Popover from './popover';

storiesOf('Popover', module).
    addDecorator(withKnobs).
    add(
        'basic popover',
        () => {
            return (<Popover>{text('text', 'some text')}</Popover>);
        },
    ).
    add(
        'basic popover with title',
        () => {
            return (<Popover title={text('title', 'some text')}>{text('text', 'some text')}</Popover>);
        },
    );
