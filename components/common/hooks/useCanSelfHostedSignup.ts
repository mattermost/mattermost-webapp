// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo, useState, useEffect} from 'react';

import {Client4} from 'mattermost-redux/client';

import useLoadStripe from './useLoadStripe';

interface CWSSignupAvailability {
    cwsContacted: boolean;
    cwsServiceOn: boolean;
}

const cwsAvailable: CWSSignupAvailability = {
    cwsContacted: true,
    cwsServiceOn: true,
};
const cwsAvailableEmptyState: CWSSignupAvailability = {
    cwsContacted: false,
    cwsServiceOn: false,
};

type SignupAvailability = CWSSignupAvailability & {
    stripeAvailable: boolean;
    ok: boolean;
}

export default function useCanSelfHostedSignup(): SignupAvailability {
    const [cwsAvailability, setCwsAvailability] = useState(cwsAvailableEmptyState);
    const stripeAvailable = Boolean(useLoadStripe().current);
    useEffect(() => {
        Client4.getAvailabilitySelfHostedSignup().
            then(() => {
                setCwsAvailability(cwsAvailable);
            }).
            catch((err) => {
                let errorValue = {...cwsAvailableEmptyState};
                switch (err.status_code) {
                case 503: {
                    errorValue = {
                        cwsServiceOn: false,
                        cwsContacted: true,
                    };
                    break;
                }

                // defined as switch because in the future we will add a separate
                // screening pending reason
                default: {
                    errorValue = {...cwsAvailableEmptyState};
                }
                }
                setCwsAvailability(errorValue);
            });
    }, []);

    // not implemented

    return useMemo(() => {
        return {
            ...cwsAvailability,
            stripeAvailable,
            ok: stripeAvailable && cwsAvailability.cwsContacted && cwsAvailability.cwsServiceOn,
        };
    }, [stripeAvailable, cwsAvailability]);
}
