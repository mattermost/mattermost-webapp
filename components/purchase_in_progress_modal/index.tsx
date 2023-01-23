// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {GenericModal, GenericModalProps} from '@mattermost/components';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import {getUserByEmail} from 'mattermost-redux/selectors/entities/users';
import {Client4} from 'mattermost-redux/client';

import CreditCardSvg from 'components/common/svg_images_components/credit_card_svg';
import {useControlPurchaseInProgressModal} from 'components/common/hooks/useControlModal';
import {STORAGE_KEY_PURCHASE_IN_PROGRESS} from 'components/self_hosted_purchase_modal/constants';

import './index.scss';
import {GlobalState} from '@mattermost/types/store';

interface Props {
    purchaserEmail: string;
}

export default function PurchaseInProgressModal(props: Props) {
    const {close} = useControlPurchaseInProgressModal();
    const currentUser = useSelector(getCurrentUser);
    const purchaserUser = useSelector((state: GlobalState) => getUserByEmail(state, props.purchaserEmail));
    const header = (
        <FormattedMessage
            id='self_hosted_signup.purchase_in_progress.title'
            defaultMessage='Purchase in progress'
        />
    );

    const sameUserAlreadyPurchasing = props.purchaserEmail === currentUser.email;
    let username = '@' + purchaserUser.username;
    if (purchaserUser.first_name && purchaserUser.last_name) {
        username = purchaserUser.first_name + ' ' + purchaserUser.last_name;
    }
    let description = (
        <FormattedMessage
            id='self_hosted_signup.purchase_in_progress.by_other'
            defaultMessage='{username} is currently attempting to purchase a paid license.'
            values={{
                username,
            }}
        />
    );
    let actionToTake;
    const genericModalProps: Partial<GenericModalProps> = {};
    if (sameUserAlreadyPurchasing) {
        description = (
            <FormattedMessage
                id='self_hosted_signup.purchase_in_progress.by_self'
                defaultMessage='You are currently attempting to purchase in another browser window. Complete your purchase or close the other window(s).'
            />
        );
        actionToTake = (
            <FormattedMessage
                id='self_hosted_signup.purchase_in_progress.by_self_restart'
                defaultMessage='If you believe this to be a mistake, restart your purchase.'
            />
        );

        genericModalProps.handleConfirm = () => {
            localStorage.removeItem(STORAGE_KEY_PURCHASE_IN_PROGRESS);
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
                {actionToTake &&
                    <div className='PurchaseInProgressModal__progress-description'>
                        {actionToTake}
                    </div>
                }
            </div>
        </GenericModal>
    );
}
