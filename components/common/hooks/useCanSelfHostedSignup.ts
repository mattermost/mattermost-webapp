// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {Client4} from 'mattermost-redux/client';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import useLoadStripe from './useLoadStripe';

export default function useCanSelfHostedSignup() {
    const [canReachPortal, setCanReachPortal] = useState(false);
    const canReachStripe = (useLoadStripe().current);
    const config = useSelector(getConfig);
    const isEnterpriseReady = config.BuildEnterpriseReady === 'true';
    useEffect(() => {
        if (!isEnterpriseReady) {
            return;
        }
        Client4.getAvailabilitySelfHostedSignup().then(() => setCanReachPortal(true));
    }, [isEnterpriseReady]);

    return canReachPortal && canReachStripe;
}
