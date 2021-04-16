// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {trackEvent} from 'actions/telemetry_actions';

export interface Props {
    buttonTextElement: JSX.Element;
}

const PurchaseLink: React.FC<Props> = (props: Props) => {
    const handlePurchaseLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        trackEvent('admin', 'in_trial_purchase_license');
        window.open('https://customers.mattermost.com/signup', '_blank');
    };

    return (
        <button
            className={'annnouncementBar__purchaseNow'}
            onClick={(e) => handlePurchaseLinkClick(e)}
        >
            {props.buttonTextElement}
        </button>
    );
};

export default PurchaseLink;
