// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef} from 'react';
import {Switch, Route} from 'react-router-dom';

import Messaging from './components/messaging';
import Composing from './components/composing';
import Mentioning from './components/mentioning';
import Formatting from './components/formatting';
import Attaching from './components/attaching';
import Commands from './components/commands';

type Props = {
    match: {
        url: string;
    };
}

export default function HelpController(props: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        containerRef.current?.scrollIntoView();
    }, []);

    return (
        <div
            ref={containerRef}
            className='help-page'
        >
            <div className='container col-sm-10 col-sm-offset-1'>
                <Switch>
                    <Route
                        path={`${props.match.url}/messaging`}
                        component={Messaging}
                    />
                    <Route
                        path={`${props.match.url}/composing`}
                        component={Composing}
                    />
                    <Route
                        path={`${props.match.url}/mentioning`}
                        component={Mentioning}
                    />
                    <Route
                        path={`${props.match.url}/formatting`}
                        component={Formatting}
                    />
                    <Route
                        path={`${props.match.url}/attaching`}
                        component={Attaching}
                    />
                    <Route
                        path={`${props.match.url}/commands`}
                        component={Commands}
                    />
                </Switch>
            </div>
        </div>
    );
}
