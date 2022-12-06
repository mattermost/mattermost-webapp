// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/admin';

import useOpenSelfHostedPurchaseModal from 'components/common/hooks/useOpenSelfHostedPurchaseModal';

export default function SelfHostedPurchaseButton() {
    const openSelfHostedPurchaseModal = useOpenSelfHostedPurchaseModal({});
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const isCloud = useSelector(isCurrentLicenseCloud);
    const selfHostedPurchaseEnabled = useSelector(getConfig)?.ServiceSettings?.SelfHostedFirstTimePurchase;

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
            {'Self-Hosted signup'}
        </button>

    );
}
