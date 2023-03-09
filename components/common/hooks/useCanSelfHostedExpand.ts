// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Client4} from 'mattermost-redux/client';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {BillingSchemes} from 'utils/constants';

export default function useCanSelfHostedExpand() {
    // NOTE: This is a basic implementation to get things up and running, more details to come later.
    const [expansionAvailable, setCwsAvailability] = useState(false);
    const config = useSelector(getConfig);
    const isEnterpriseReady = config.BuildEnterpriseReady === 'true';
    const isSalesServeOnly = useSelector(getSubscriptionProduct)?.billing_scheme === BillingSchemes.SALES_SERVE;

    useEffect(() => {
        if (!isEnterpriseReady) {
            return;
        }
        Client4.getAvailabilitySelfHostedExpansion().
            then(() => {
                setCwsAvailability(true);
            }).
            catch(() => {
                setCwsAvailability(false);
            });
    }, []);
    return !isSalesServeOnly && expansionAvailable;
}
