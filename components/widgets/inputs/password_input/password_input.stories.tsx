// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import PasswordInput from './password_input';

const inputValueChange = action('onChange');

storiesOf('Widgets/Inputs/Password Input', module).
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
                    <PasswordInput
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
        'Create mode',
        () => {
            const WrapperComponent = () => {
                const [value, setValue] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setValue(newValue);
                    inputValueChange(newValue);
                };

                return (
                    <PasswordInput
                        value={value}
                        onChange={handleOnChange}
                        createMode={true}
                    />
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    );
