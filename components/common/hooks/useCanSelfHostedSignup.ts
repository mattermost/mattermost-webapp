// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState, useEffect, useMemo} from 'react';

import {Client4} from 'mattermost-redux/client';

import useLoadStripe from './useLoadStripe';

interface CanSelfHostedSignup {
    ok: boolean;
    screeningInProgress: boolean;
}
export default function useCanSelfHostedSignup(): CanSelfHostedSignup {
    const [canReachPortal, setCanReachPortal] = useState(false);
    const [screeningInProgress, setScreeningInProgress] = useState(false);
    const canReachStripe = (useLoadStripe().current);
    useEffect(() => {
        Client4.getAvailabilitySelfHostedSignup().
            then(() => {
                setScreeningInProgress(false);
                setCanReachPortal(true);
            }).
            catch((error) => {
                if (error.status_code === 425) {
                    setScreeningInProgress(true);
                }
            });
    }, []);

    return useMemo(() => ({
        ok: canReachPortal && Boolean(canReachStripe) && !screeningInProgress,
        screeningInProgress,
    }), [canReachPortal, canReachStripe, screeningInProgress]);
}
