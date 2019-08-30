// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import LoadingSpinner from './loading_spinner';
import LoadingWrapper from './loading_wrapper';

storiesOf('Loading', module).
    addDecorator(withKnobs).
    add('loadingSpinner',
        () => {
            return (
                <div>
                    <h2>{'Loading spinner without text'}</h2>
                    <LoadingSpinner/>
                    <h2>{'Loading spinner without text'}</h2>
                    <LoadingSpinner text={text('Text', 'Loading')}/>
                </div>
            );
        },
        {
            notes: {markdown: 'Loading spinner'},
        }
    ).
    add('loadingWrapper', () => {
        const LoadingExample = () => {
            const [loading, setLoading] = useState(false);
            const loadingFunc = (e) => {
                e.preventDefault();
                setLoading(true);
                setTimeout(() => setLoading(false), 2000);
            };
            return (
                <div>
                    <a
                        className='btn btn-primary'
                        onClick={loadingFunc}
                    >
                        <LoadingWrapper
                            loading={loading}
                            text='loading'
                        >
                            {'Load'}
                        </LoadingWrapper>
                    </a>
                </div>
            );
        };

        const content = text('Content', 'Content');
        return (
            <div>
                <h2>{'Wrapped contend not loading'}</h2>
                <LoadingWrapper loading={false}>{content}</LoadingWrapper>
                <h2>{'Wrapped contend loading'}</h2>
                <LoadingWrapper loading={true}>{content}</LoadingWrapper>
                <h2>{'Sample'}</h2>
                <LoadingExample/>
            </div>
        );
    });
