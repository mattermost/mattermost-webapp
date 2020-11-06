// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {text, withKnobs} from '@storybook/addon-knobs';

import OverlayTrigger from 'components/overlay_trigger';

import Popover from '.';

storiesOf('Widgets/Popover', module).
    addDecorator(withKnobs).
    add(
        'basic popover',
        () => {
            return (<Popover id='popover'>{text('text', 'some text')}</Popover>);
        },
    ).
    add(
        'basic popover with title',
        () => {
            return (
                <Popover
                    id='popover'
                    title={text('title', 'some text')}
                >
                    {text('text', 'some text')}
                </Popover>
            );
        },
    ).
    add(
        'popover on button',
        () => {
            return (
                <OverlayTrigger
                    placement='bottom'
                    overlay={(
                        <Popover
                            id='popover'
                            title={text('title', 'some text')}
                        >
                            {text('text', 'some text')}
                        </Popover>
                    )}
                >
                    <button style={{position: 'absolute', left: 100, top: 100}}>{'trigger'}</button>
                </OverlayTrigger>
            );
        },
    );
