// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';

type Props = {
    plan: string;

}

function AtPlanMention(props: Props) {
    const openPricingModal = useOpenPricingModal();
    const openPurchaseModal = useOpenCloudPurchaseModal({});

    const handleClick = () => {
        if (props.plan === 'Enterprise trial') {
            openPricingModal();
        }

        if (props.plan === 'Professional plan') {
            openPurchaseModal();
        }
    };
    return (
        <a
            onClick={handleClick}
        >
            {props.plan}
        </a>

    );
}

export default AtPlanMention;
