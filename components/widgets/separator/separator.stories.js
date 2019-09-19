// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {select, text, withKnobs} from '@storybook/addon-knobs';

import Separator from './separator';

const styleKnob = () => select('Style', ['date-separator', 'new-separator'], 'date-separator');

storiesOf('Separator', module).
    addDecorator(withKnobs).
    add(
        'plain',
        () => {
            return (<Separator className={styleKnob()}/>);
        }
    ).add(
        'with text',
        () => {
            return (
                <Separator className={styleKnob()}>
                    {text('Text', 'Some text')}
                </Separator>
            );
        }
    );
