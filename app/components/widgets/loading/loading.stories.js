// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import LoadingSpinner from './loading_spinner';
import LoadingWrapper from './loading_wrapper';

storiesOf('Widgets/Loading', module).
    addDecorator(withKnobs).
    add('LoadingSpinner without text',
        () => (<LoadingSpinner/>),
    ).
    add('LoadingSpinner with text',
        () => <LoadingSpinner text={text('Text', 'Loading')}/>,
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

        return (<LoadingExample/>);
    });
