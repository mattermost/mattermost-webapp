// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {completeUserData} from 'actions/global_actions.jsx';

import LoadingScreen from 'components/loading_screen.tsx';

export default class CompleteUserData extends React.Component {
    componentDidMount() {
        completeUserData();
    }

    render() {
        return (
            <LoadingScreen/>
        );
    }
}
