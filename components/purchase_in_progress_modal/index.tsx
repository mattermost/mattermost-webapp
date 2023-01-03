// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {GenericModal, GenericModalProps} from '@mattermost/components';

import {getCurrentUserEmail} from 'mattermost-redux/selectors/entities/common';
import {Client4} from 'mattermost-redux/client';

import CreditCardSvg from 'components/common/svg_images_components/credit_card_svg';
import {useControlPurchaseInProgressModal} from 'components/common/hooks/useControlModal';

import './index.scss';

interface Props {
    purchaserEmail: string;
}

export default function PurchaseInProgressModal(props: Props) {
    const {close} = useControlPurchaseInProgressModal();
    const userEmail = useSelector(getCurrentUserEmail);
    const header = (
        <FormattedMessage
            id='self_hosted_signup.purchase_in_progress.title'
            defaultMessage='Purchase in progress'
        />
    );

    const sameUserAlreadyPurchasing = props.purchaserEmail === userEmail;
    let description = (
        <FormattedMessage
            id='self_hosted_signup.purchase_in_progress.by_other'
            defaultMessage='Purchase is being attempted by {email}. Try again after they have finished.'
            values={{
                email: props.purchaserEmail,
            }}
        />
    );
    const genericModalProps: Partial<GenericModalProps> = {};
    if (sameUserAlreadyPurchasing) {
        description = (
            <FormattedMessage
                id='self_hosted_signup.purchase_in_progress.by_self'
                defaultMessage='You are already attempting purchase in another browser window. Please finish purchase in that window or close the modal before attempting in this window. If you are sure there is no other purchase window in progress, you can cancel the pending transaction by clicking the button below.'
            />
        );
        genericModalProps.handleConfirm = () => {
            Client4.bootstrapSelfHostedSignup(true);
            close();
        };
        genericModalProps.confirmButtonText = (
            <FormattedMessage
                id='self_hosted_signup.purchase_in_progress.reset'
                defaultMessage='Reset purchase flow'
            />
        );
    }
    return (
        <GenericModal
            onExited={close}
            show={true}
            modalHeaderText={header}
            compassDesign={true}
            className='PurchaseInProgressModal'
            {...genericModalProps}
        >
            <div className='PurchaseInProgressModal__body'>
                <CreditCardSvg
                    height={350}
                    width={350}
                />
                <div className='PurchaseInProgressModal__progress-description'>
                    {description}
                </div>
            </div>
        </GenericModal>
    );
}
