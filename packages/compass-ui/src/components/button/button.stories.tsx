// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MuiButton from '@mui/material/Button';
import {ComponentStory} from '@storybook/react';

import Button, {WrappedMuiButton} from './button';

export default {
    title: 'Button',
    component: Button,
};

export const Compass: ComponentStory<typeof Button> = (args) => {
    return <Button {...args}>{'Compass Button'}</Button>;
};
Compass.args = {
    variant: 'primary',
    destructive: false,
    disabled: false,
    size: 'medium',
};
Compass.argTypes = {
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

export const WrappedMaterial: ComponentStory<typeof Button> = (args) => {
    return <WrappedMuiButton {...args}>{'WrappedMaterial Button'}</WrappedMuiButton>;
};
WrappedMaterial.args = {
    variant: 'primary',
    destructive: false,
    disabled: false,
    size: 'medium',
};
WrappedMaterial.argTypes = {
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

export const MaterialExample: ComponentStory<typeof MuiButton> = (args) => {
    return <MuiButton {...args}>{'Material Button'}</MuiButton>;
};
MaterialExample.args = {
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    disabled: false,
};
MaterialExample.argTypes = {
    variant: {
        control: 'select',
        options: [
            'text',
            'outlined',
            'contained',
        ],
    },
    color: {
        control: 'select',
        options: [
            'primary',
            'error',
        ],
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
    disabled: {
        control: 'boolean',
    },
};
