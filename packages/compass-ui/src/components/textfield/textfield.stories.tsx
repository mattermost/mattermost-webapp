// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentStory} from '@storybook/react';
import React, {useState} from 'react';

import Textfield from './textfield';

export default {
    title: 'Textfield',
    component: Textfield,
};

export const Outlined: ComponentStory<typeof Textfield> = (args) => {
    const [value, setValue] = useState('');
    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value);
    return (
        <Textfield
            {...args}
            value={value}
            onChange={handleOnChange}
        />
    );
};
Outlined.args = {
    label: 'example Label',
    size: 'small',
};
Outlined.argTypes = {
    label: {
        control: 'text',
    },
    size: {
        control: 'select',
        options: [
            'small',
            'medium',
        ],
    },
};
