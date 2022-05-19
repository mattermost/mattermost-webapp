// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';

import UsagePercentBar from './';

storiesOf('Components/Card', module).
    addDecorator(withKnobs).
    add(
        'defaultThrshold',
        () => (
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
                <UsagePercentBar percent={10}/>
                <UsagePercentBar percent={50}/>
                <UsagePercentBar percent={90}/>
                <UsagePercentBar percent={110}/>
            </div>
        ),
    ).
    add(
        'transitions',
        () => {
            const [percent, setPercent] = useState(10);
            useEffect(() => {
                const interval = setInterval(() => {
                    setPercent((currentPercent) => (currentPercent > 100 ? 0 : currentPercent + 10));
                }, 500);
                return () => {
                    clearInterval(interval);
                };
            }, []);
            return <UsagePercentBar percent={percent}/>;
        },
    );
