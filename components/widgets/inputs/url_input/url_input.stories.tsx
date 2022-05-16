// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import StoryBox from 'storybook/story_box';

import URLInput from './url_input';

const inputValueChange = action('onChange');
const inputBlur = action('onBlur');

const validateChars = (url: string) => (!url && 'URL is required') || (url.match(/[^A-Za-z0-9-_]/g) && 'Special characters cannot be used in the URL') || '';

storiesOf('Widgets/Inputs/URL Input', module).
    add(
        'Default',
        () => {
            const WrapperComponent = () => {
                const [pathInfo, setPathInfo] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setPathInfo(newValue);
                    inputValueChange(newValue);
                };

                return (
                    <StoryBox containerStyle={{width: 600, padding: 32}}>
                        <URLInput
                            base={window.location.origin}
                            pathInfo={pathInfo}
                            onChange={handleOnChange}
                        />
                    </StoryBox>
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With custom shorten URL',
        () => {
            const WrapperComponent = () => {
                const [pathInfo, setPathInfo] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setPathInfo(newValue);
                    inputValueChange(newValue);
                };

                const handleOnBlur = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
                    inputBlur(value);
                };

                return (
                    <StoryBox containerStyle={{width: 600, padding: 32}}>
                        <URLInput
                            base='https://community.mattermost.com'
                            path='mattermost-pr-10030/channels'
                            pathInfo={pathInfo}
                            shortenLength={52}
                            onChange={handleOnChange}
                            onBlur={handleOnBlur}
                        />
                    </StoryBox>
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
                const [pathInfo, setPathInfo] = useState('');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setPathInfo(newValue);
                    inputValueChange(newValue);
                };

                const handleOnBlur = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
                    inputBlur(value);
                };

                return (
                    <StoryBox containerStyle={{width: 600, padding: 32}}>
                        <URLInput
                            base='https://community.mattermost.com'
                            path='test/channels'
                            pathInfo={pathInfo}
                            limit={10}
                            shortenLength={52}
                            onChange={handleOnChange}
                            onBlur={handleOnBlur}
                        />
                    </StoryBox>
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
                const [pathInfo, setPathInfo] = useState('');
                const [error, setError] = useState('URL is required');

                const handleOnChange = ({target: {value: newValue}}: React.ChangeEvent<HTMLInputElement>) => {
                    setPathInfo(newValue);
                    setError(validateChars(newValue));
                    inputValueChange(newValue);
                };

                const handleOnBlur = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
                    setError(validateChars(value));

                    inputBlur(value);
                };

                return (
                    <StoryBox containerStyle={{width: 600, padding: 32}}>
                        <URLInput
                            base='https://community.mattermost.com'
                            path='test/channels'
                            pathInfo={pathInfo}
                            shortenLength={52}
                            error={error}
                            onChange={handleOnChange}
                            onBlur={handleOnBlur}
                        />
                    </StoryBox>
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    );
