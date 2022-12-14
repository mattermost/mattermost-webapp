// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {getCloudSubscription, getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {isCloudLicense} from 'utils/license_utils';
import {CloudProducts} from 'utils/constants';

/**
 * Returns some checks for free trial users or starter licenses
 */
export function useLicenseChecks(): {isStarterFree: boolean; isFreeTrial: boolean; isEnterpriseReady: boolean} {
    const subscription = useSelector(getCloudSubscription);
    const license = useSelector(getLicense);
    const subscriptionProduct = useSelector(getSubscriptionProduct);
    const config = useSelector(getConfig);

    const isCloud = isCloudLicense(license);
    const isCloudStarterFree = isCloud && subscriptionProduct?.sku === CloudProducts.STARTER;
    const isCloudFreeTrial = isCloud && subscription?.is_free_trial === 'true';

    const isEnterpriseReady = config.BuildEnterpriseReady === 'true';
    const isSelfHostedStarter = isEnterpriseReady && (license.IsLicensed === 'false');
    const isSelfHostedFreeTrial = license.IsTrial === 'true';

    const isStarterFree = isCloudStarterFree || isSelfHostedStarter;
    const isFreeTrial = isCloudFreeTrial || isSelfHostedFreeTrial;

    return {
        isStarterFree,
        isFreeTrial,
        isEnterpriseReady,
    };
}
