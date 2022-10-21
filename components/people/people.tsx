// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import {Route, Switch, useRouteMatch, Redirect} from 'react-router-dom';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {applyTheme} from 'utils/utils';

import Profile from './profile/profile';
import Directory from './directory/directory';
import Sidebar from './sidebar/sidebar';
import Groups from './groups/groups';

function useInitTheme() {
    const currentTheme = useSelector(getTheme);
    useEffect(() => {
        // This class, critical for all the styling to work, is added by ChannelController,
        // which is not loaded when rendering this root component.
        document.body.classList.add('app__body');
        const root = document.getElementById('root');
        if (root) {
            root.className += ' channel-view';
        }

        applyTheme(currentTheme);
        return function cleanUp() {
            document.body.classList.remove('app__body');
        };
    }, [currentTheme]);
}

export default function People() {
    useInitTheme();
    const {path} = useRouteMatch();

    return (
        <PeopleRoot
            css={`
                background: rgba(var(--center-channel-color-rgb), 0.04);
            `}
        >
            <Sidebar/>
            <Switch>
                <Route path={`${path}/groups`}>
                    <Groups/>
                </Route>
                <Redirect
                    from={`${path}/@:username`}
                    to={`${path}/:username`}
                />
                <Route path={`${path}/:username`}>
                    <Profile/>
                </Route>
                <Route>
                    <Directory/>
                </Route>
            </Switch>
        </PeopleRoot>
    );
}

const PeopleRoot = styled.div`
    display: flex;
    height: 100%;
`;