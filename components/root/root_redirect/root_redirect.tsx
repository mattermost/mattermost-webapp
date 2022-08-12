// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {Redirect} from 'react-router-dom';

import * as GlobalActions from 'actions/global_actions';
import {browserHistory} from 'utils/browser_history';

export type Props = {
    isElegibleForFirstAdmingOnboarding: boolean;
    currentUserId: string;
    location?: Location;
    isFirstAdmin: boolean;
    actions: {
        getFirstAdminSetupComplete: () => Promise<{data: boolean; error: any}>;
    };
}

export default function RootRedirect(props: Props) {
    useEffect(() => {
        if (props.currentUserId) {
            if (props.isElegibleForFirstAdmingOnboarding) {
                props.actions.getFirstAdminSetupComplete().then((firstAdminCompletedSignup) => {
                    // root.tsx ensures admin profiles are eventually loaded
                    if (firstAdminCompletedSignup.data === false && props.isFirstAdmin) {
                        browserHistory.push('/preparing-workspace');
                    } else {
                        GlobalActions.redirectUserToDefaultTeam();
                    }
                });
            } else {
                GlobalActions.redirectUserToDefaultTeam();
            }
        }
    }, [props.currentUserId, props.isElegibleForFirstAdmingOnboarding]);

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
