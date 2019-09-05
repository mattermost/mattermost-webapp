// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';

import TeamIcon from './team_icon';

storiesOf('Team Icon', module).
    addDecorator(withKnobs).
    add(
        'initials',
        () => {
            return (<TeamIcon team={{display_name: 'Team Icon'}}/>);
        }
    ).add(
        'logo',
        () => {
            return (
                <TeamIcon
                    url='https://mattermost.com/wp-content/themes/mattermostv3/favicon-32x32.png'
                    team={{display_name: 'Team Icon'}}
                />
            );
        }
    );
