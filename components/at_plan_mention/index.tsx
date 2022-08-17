// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';

type Props = {
    plan: string;

}

function AtPlanMention(props: Props) {
    const openPricingModal = useOpenPricingModal();
    const openPurchaseModal = useOpenCloudPurchaseModal({});
    const openSalesLink = useOpenSalesLink();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();

        if (props.plan === 'Enterprise trial') {
            openPricingModal({trackingLocation: 'notify_admin_message_view'});
        }

        if (props.plan === 'Enterprise plan') {
            openSalesLink();
        }

        if (props.plan === 'Professional plan') {
            openPurchaseModal({trackingLocation: 'notify_admin_message_view'});
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
