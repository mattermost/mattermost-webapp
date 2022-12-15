// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ComponentStory} from '@storybook/react';

import Button from './button';

export default {
    title: 'Button',
    component: Button,
};

export const NormalButton: ComponentStory<typeof Button> = (args) => {
    return <Button {...args}>{'WrappedMaterial Button'}</Button>;
};
NormalButton.args = {
    variant: 'primary',
    destructive: false,
    disabled: false,
    size: 'medium',
};
NormalButton.argTypes = {
    variant: {
        control: 'select',
        options: [
            'primary',
            'secondary',
            'tertiary',
        ],
    },
    destructive: {
        control: 'boolean',
    },
    disabled: {
        control: 'boolean',
    },
    size: {
        control: 'select',
        options: [
            'x-small',
            'small',
            'medium',
            'large',
        ],
    },
};
