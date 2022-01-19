// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {Redirect} from 'react-router-dom';

import * as GlobalActions from 'actions/global_actions';

type Props = {
    currentUserId: string;
    location: Location;
}

export default function RootRedirect(props: Props) {
    useEffect(() => {
        if (props.currentUserId) {
            GlobalActions.redirectUserToDefaultTeam();
        }
    }, [props.currentUserId]);

    if (props.currentUserId) {
        // Ideally, this would be a Redirect like below, but since we need to call an action, this redirect is done above
        return null;
    }

    return (
        <Redirect
            to={{
                ...props.location,
                pathname: '/login',
            }}
        />
    );
}
