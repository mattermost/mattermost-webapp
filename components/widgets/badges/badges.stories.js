// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

import Badge from './badge';
import GuestBadge from './guest_badge';
import BotBadge from './bot_badge';

storiesOf('Widgets/Badges', module).
    addDecorator(withKnobs).
    add(
        'regular badge',
        () => {
            const content = text('Text', 'BADGE');
            return (<Badge show={boolean('Show', true)}>{content}</Badge>);
        },
    ).
    add(
        'regular badge, clickable',
        () => {
            const content = text('Text', 'BADGE');
            return (
                <Badge
                    show={boolean('Show', true)}
                    onClick={action('click!')}
                >
                    {content}
                </Badge>
            );
        },
    ).
    add(
        'guest badge',
        () => <GuestBadge show={boolean('Show', true)}/>,
    ).
    add(
        'bot badge',
        () => <BotBadge show={boolean('Show', true)}/>,
    );
