// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';

import {Client4} from 'mattermost-redux/client';

export default function useCWSAvailabilityCheck() {
    const [canReachCWS, setCanReachCWS] = useState(false);
    useEffect(() => {
        Client4.cwsAvailabilityCheck().then(() => setCanReachCWS(true));
    }, []);

    return canReachCWS;
}
