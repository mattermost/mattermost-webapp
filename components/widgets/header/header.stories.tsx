// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, number} from '@storybook/addon-knobs';

import StoryBox from 'storybook/story_box';

import Header from './';

storiesOf('Widgets/Header', module).
    addDecorator(withKnobs).
    add('ThreadHeader', () => {
        return (
            <StoryBox containerStyle={{width: 600}}>
                <Header
                    level={number('level', 0, {min: 0, max: 6}) as ComponentProps<typeof Header>['level']}
                    heading={'Title'}
                    subtitle='Subheading'
                    right={(
                        <div>{'addons'}</div>
                    )}
                />
            </StoryBox>
        );
    });
