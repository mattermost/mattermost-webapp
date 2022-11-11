// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getFeatureFlagValue} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from '@mattermost/types/store';

import useOpenSelfHostedPurchaseModal from 'components/common/hooks/useOpenSelfHostedPurchaseModal';

export default function SelfHostedPurchaseButton() {
    const openSelfHostedPurchaseModal = useOpenSelfHostedPurchaseModal({});
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const isCloud = useSelector(isCurrentLicenseCloud);
    const selfHostedPurchaseEnabled = useSelector((state: GlobalState) => getFeatureFlagValue(state, 'SelfHostedFirstTimePurchase')) === 'true';

    if (!selfHostedPurchaseEnabled || isCloud || !isAdmin) {
        return null;
    }

    return (
        <button
            style={{
                background: 'black',
                color: 'white',
            }}
            onClick={() => {
                openSelfHostedPurchaseModal({});
            }}
        >
            {'paid self hosted'}
        </button>

    );
}
