// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';

import Badge from './badge';
import GuestBadge from './guest_badge';
import BotBadge from './bot_badge';

storiesOf('Badges', module).
    addDecorator(withKnobs).
    add(
        'regular badge',
        () => {
            const content = text('Text', 'BADGE');
            return (<Badge show={boolean('Show', true)}>{content}</Badge>);
        }
    ).
    add(
        'guest badge',
        () => <GuestBadge show={boolean('Show', true)}/>,
    ).
    add(
        'bot badge',
        () => <BotBadge show={boolean('Show', true)}/>,
    );
