// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/admin';

import {trackEvent} from 'actions/telemetry_actions';

import {CloudLinks, SelfHostedProducts} from 'utils/constants';
import {findSelfHostedProductBySku} from 'utils/hosted_customer';

import useOpenSelfHostedPurchaseModal from 'components/common/hooks/useOpenSelfHostedPurchaseModal';
import useGetSelfHostedProducts from 'components/common/hooks/useGetSelfHostedProducts';
import useCanSelfHostedSignup from 'components/common/hooks/useCanSelfHostedSignup';
import useOpenAirGappedSelfHostedPurchaseModal from 'components/common/hooks/useOpenAirGappedSelfHostedPurchaseModal';

import './purchase_link.scss';

export interface Props {
    buttonTextElement: JSX.Element;
    eventID?: string;
}

const PurchaseLink: React.FC<Props> = (props: Props) => {
    const openAirGappedPurchaseModal = useOpenAirGappedSelfHostedPurchaseModal();
    const canUseSelfHostedSignup = useCanSelfHostedSignup();
    const openSelfHostedPurchaseModal = useOpenSelfHostedPurchaseModal({});
    const [products, productsLoaded] = useGetSelfHostedProducts();
    const isSelfHostedPurchaseEnabled = useSelector(getConfig)?.ServiceSettings?.SelfHostedPurchase;

    const handlePurchaseLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        trackEvent('admin', props.eventID || 'in_trial_purchase_license');
        if (!isSelfHostedPurchaseEnabled) {
            window.open(CloudLinks.SELF_HOSTED_SIGNUP, '_blank');
            return;
        }

        if (!canUseSelfHostedSignup) {
            openAirGappedPurchaseModal();
            return;
        }

        const professionalProduct = findSelfHostedProductBySku(products, SelfHostedProducts.PROFESSIONAL);
        if (productsLoaded && professionalProduct) {
            openSelfHostedPurchaseModal({productId: professionalProduct.id});
        }
    };

    return (
        <button
            id={props.eventID}
            className={'annnouncementBar__purchaseNow'}
            onClick={handlePurchaseLinkClick}
        >
            {props.buttonTextElement}
        </button>
    );
};

export default PurchaseLink;
