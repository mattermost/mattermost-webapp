// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, boolean, number, text, date} from '@storybook/addon-knobs';

import StoryBox from 'storybook/story_box';

import Header from './';

storiesOf('Widgets/Header', module).
    addDecorator(withKnobs).
    add('ThreadHeader', () => {
        return (
            <StoryBox containerStyle={{width: 600}}>
                <Header
                    level={0}
                    heading={'Title'}
                    subtitle='Subheading'
                    right={(
                        <div>{'addons'}</div>
                    )}
                />
            </StoryBox>
        );
    });
