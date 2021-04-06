// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import ChannelsInput from './channels_input';
import UsersEmailsInput from './users_emails_input';

storiesOf('Widgets/Inputs', module).
    addDecorator(withKnobs).
    add(
        'channels input',
        () => {
            const WrapperComponent = () => {
                const placeholder = text('Placeholder', 'Placeholder');
                const ariaLabel = text('Aria Label', 'Aria Label');
                const loadingMessageDefault = text('Loading Message', 'Loading');
                const noOptionsMessageDefault = text('No Options Message', 'No channels found');
                const options = [
                    {id: '1', name: 'public', display_name: 'Public Channel', type: 'O'},
                    {id: '2', name: 'private', display_name: 'Private Channel', type: 'P'},
                    {id: '3', name: 'town-square', display_name: 'Town Square', type: 'O'},
                    {id: '4', name: 'off-topic', display_name: 'Off Topic', type: 'O'},
                ];

                const [value, setValue] = useState([]);
                const [inputValue, setInputValue] = useState('');

                const channelsLoader = (input, callback) => {
                    const values = options.filter((channel) => channel.display_name.toLowerCase().startsWith(input.toLowerCase()));
                    setTimeout(() => callback(values), 500);
                };

                return (
                    <ChannelsInput
                        channelsLoader={channelsLoader}
                        placeholder={placeholder}
                        ariaLabel={ariaLabel}
                        onChange={setValue}
                        value={value}
                        onInputChange={setInputValue}
                        inputValue={inputValue}
                        loadingMessageDefault={loadingMessageDefault}
                        loadingMessageId='not-existing-id'
                        noOptionsMessageDefault={noOptionsMessageDefault}
                        noOptionsMessageId='not-existing-id'
                    />
                );
            };
            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'users emails input',
        () => {
            const WrapperComponent = () => {
                const placeholder = text('Placeholder', 'Placeholder');
                const ariaLabel = text('Aria Label', 'Aria Label');
                const loadingMessageDefault = text('Loading Message', 'Loading');
                const noMatchMessageDefault = text('No Match Message', 'No one found matching **{text}**, type email address');
                const validAddressMessageDefault = text('Valid Address', 'Add **{email}**');
                const options = [
                    {id: '1', username: 'jesus.espino', first_name: 'Jesús', last_name: 'Espino', nickname: 'jespino'},
                    {id: '2', username: 'jora.wilander', first_name: 'Joram', last_name: 'Wilander', nickname: 'jwilander'},
                    {id: '3', username: 'ben.schumaher', first_name: 'Ben', last_name: 'Schumacher', nickname: 'Hanzei'},
                    {id: '4', username: 'martin.kraft', first_name: 'Martin', last_name: 'Kraft', nickname: 'mkraft'},
                ];

                const [value, setValue] = useState([]);
                const [inputValue, setInputValue] = useState('');

                const usersLoader = (input, callback) => {
                    const values = options.filter((user) => {
                        return (
                            user.first_name.toLowerCase().startsWith(input.toLowerCase()) ||
                            user.last_name.toLowerCase().startsWith(input.toLowerCase()) ||
                            user.username.toLowerCase().startsWith(input.toLowerCase()) ||
                            user.nickname.toLowerCase().startsWith(input.toLowerCase())
                        );
                    });
                    setTimeout(() => callback(values), 500);
                };

                return (
                    <UsersEmailsInput
                        usersLoader={usersLoader}
                        placeholder={placeholder}
                        ariaLabel={ariaLabel}
                        onChange={setValue}
                        value={value}
                        onInputChange={setInputValue}
                        inputValue={inputValue}
                        loadingMessageDefault={loadingMessageDefault}
                        loadingMessageId='not-existing-id'
                        noMatchMessageDefault={noMatchMessageDefault}
                        noMatchMessageId='not-existing-id'
                        validAddressMessageDefault={validAddressMessageDefault}
                        validAddressMessageId='not-existing-id'
                    />
                );
            };
            return (
                <WrapperComponent/>
            );
        },
    );
