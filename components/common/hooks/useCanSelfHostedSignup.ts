// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState, useEffect} from 'react';

import {Client4} from 'mattermost-redux/client';

import useLoadStripe from './useLoadStripe';

export default function useCanSelfHostedSignup() {
    const [canReachPortal, setCanReachPortal] = useState(false);
    const canReachStripe = (useLoadStripe().current);
    useEffect(() => {
        Client4.getAvailabilitySelfHostedSignup().then(() => setCanReachPortal(true));
    }, []);

    return canReachPortal && canReachStripe;
}
