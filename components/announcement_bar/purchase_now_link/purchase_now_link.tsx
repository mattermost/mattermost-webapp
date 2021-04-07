// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {trackEvent} from 'actions/telemetry_actions';

export interface Props {
    className?: string;
    buttonTextElement: JSX.Element;
}

const PurchaseNowLink: React.FC<Props>  = (props: Props) => {
    const handlePurchaseLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        window.open('https://customers.mattermost.com/signup', '_blank');
        trackEvent('admin', 'in_trial_purchase_license');
    };

    return (
        <button
            className={props.className}
            onClick={(e) => handlePurchaseLinkClick(e)}
        >
            {props.buttonTextElement}
        </button>
    );
};

export default PurchaseNowLink;