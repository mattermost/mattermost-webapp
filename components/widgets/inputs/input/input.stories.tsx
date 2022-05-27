// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import {ItemStatus} from 'utils/constants';

import Input from './input';

const inputValueChange = action('onChange');
const inputBlur = action('onBlur');

storiesOf('Widgets/Inputs/Input', module).
    add(
        'Default',
        () => {
            const WrapperComponent = () => {
                const [value, setValue] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setValue(newValue);
                    inputValueChange(newValue);
                };

                return (
                    <Input
                        type='text'
                        value={value}
                        onChange={handleOnChange}
                    />
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With placeholder',
        () => {
            const WrapperComponent = () => {
                const [value, setValue] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setValue(newValue);
                    inputValueChange(newValue);
                };

                return (
                    <Input
                        type='text'
                        value={value}
                        name='placeholder'
                        placeholder='Channel name'
                        onChange={handleOnChange}
                    />
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With label and placeholder',
        () => {
            const WrapperComponent = () => {
                const [value, setValue] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setValue(newValue);
                    inputValueChange(newValue);
                };

                return (
                    <Input
                        type='text'
                        value={value}
                        name='label-placeholder'
                        label='Channel name'
                        placeholder='Enter a name for your new channel'
                        onChange={handleOnChange}
                    />
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With info',
        () => {
            const WrapperComponent = () => {
                const [value, setValue] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setValue(newValue);
                    inputValueChange(newValue);
                };

                return (
                    <Input
                        type='text'
                        value={value}
                        name='info'
                        label='Channel name'
                        placeholder='Enter a name for your new channel'
                        customMessage={{type: 'info', value: 'Should have at least 2 characters'}}
                        onChange={handleOnChange}
                    />
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With error',
        () => {
            const WrapperComponent = () => {
                const [value, setValue] = useState('');
                const [error, setError] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setValue(newValue);
                    setError(newValue.length < 5 ? 'Must have at least 5 characters' : '');
                    inputValueChange(newValue);
                };

                const handleOnBlur = () => {
                    if (error && value.length === 0) {
                        setError('');
                    }
                    inputBlur();
                };

                return (
                    <Input
                        type='text'
                        value={value}
                        name='error'
                        label='Channel name'
                        placeholder='Enter a name with at least 5 characters'
                        customMessage={{type: ItemStatus.ERROR, value: error}}
                        onChange={handleOnChange}
                        onBlur={handleOnBlur}
                    />
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With required',
        () => {
            const WrapperComponent = () => {
                const [value, setValue] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setValue(newValue);
                    inputValueChange(newValue);
                };

                return (
                    <Input
                        type='text'
                        value={value}
                        name='required'
                        label='Channel name'
                        placeholder='Enter a name for your new channel'
                        required={true}
                        onChange={handleOnChange}
                    />
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With limit',
        () => {
            const WrapperComponent = () => {
                const [value, setValue] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setValue(newValue);
                    inputValueChange(newValue);
                };

                return (
                    <Input
                        type='text'
                        value={value}
                        name='limit'
                        label='Channel name'
                        placeholder='Enter a name with maximum 10 characters'
                        limit={10}
                        onChange={handleOnChange}
                    />
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With max length',
        () => {
            const WrapperComponent = () => {
                const [value, setValue] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setValue(newValue);
                    inputValueChange(newValue);
                };

                return (
                    <Input
                        type='text'
                        value={value}
                        name='max-length'
                        label='Channel name'
                        placeholder='Enter a name with maximum 10 characters'
                        maxLength={10}
                        onChange={handleOnChange}
                    />
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'Disabled',
        () => {
            const WrapperComponent = () => {
                return (
                    <Input
                        type='text'
                        value='lorem ipsum'
                        disabled={true}
                    />
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    );
