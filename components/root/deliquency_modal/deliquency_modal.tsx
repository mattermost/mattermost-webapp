// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {Subscription} from '@mattermost/types/cloud';
import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import UpgradeSvg from 'components/common/svg_images_components/upgrade_svg';
import {ModalData} from 'types/actions';

import './deliquency_modal.scss';
import {FreemiumModal} from './freemium_modal';

interface DeliquencyModalProps {
    subscription: Subscription;
    show: boolean;
    actions: {
        getCloudSubscription: () => void;
        closeModal: () => void;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

const DeliquencyModal = (props: DeliquencyModalProps) => {
    // TODO: Ask about tracking location
    const {subscription, actions, show} = props;
    const {closeModal} = actions;
    const openPurchaseModal = useOpenCloudPurchaseModal({isDelinquencyModal: true});
    const [showFreemium, setShowFremium] = useState(false);

    const showFremium = () => {
        setShowFremium(() => true);
    };

    if (subscription == null) {
        return null;
    }

    return (
        <Modal
            dialogClassName='a11y__modal more-modal more-modal--action DeliquencyModal'
            show={show}
            onHide={closeModal}
            onExited={closeModal}
            role='dialog'
            id='moreChannelsModal'
            aria-labelledby='moreChannelsModalLabel'
        >
            {!showFreemium && <><Modal.Header className='DeliquencyModal__header '>
                <button
                    id='closeIcon'
                    className='icon icon-close DeliquencyModal__header__close'
                    aria-label='Close'
                    title='Close'
                    onClick={closeModal}
                />
            </Modal.Header>
            <Modal.Body className='DeliquencyModal__body'>
                <UpgradeSvg
                    width={217}
                    height={164}
                />
                <FormattedMessage
                    id='cloud_delinquency.modal.workspace_downgraded'
                    defaultMessage='Your workspace has been downgraded'
                >
                    {(text) => <h3 className='DeliquencyModal__body__title'>{text}</h3>}
                </FormattedMessage>
                <FormattedMessage
                    id='cloud_delinquency.modal.workspace_downgraded_description'
                    defaultMessage='Due to payment issues on your {paidPlan}, your workspace has been downgraded to the free plan. To access {paid plan} features again, update your billing information now.'
                    values={{
                        paidPlan: subscription.product_id, // Pasar de productId a Nombre del producto
                    }}
                >
                    {(text) => <p className='DeliquencyModal__body__information'>{text}</p>}
                </FormattedMessage>
            </Modal.Body>
            <Modal.Footer className={'DeliquencyModal__footer '}>
                <button
                    className={'DeliquencyModal__footer__freemium'}
                    id={'inviteMembersButton'}
                    onClick={() => {
                        showFremium();
                    }}
                >
                    <FormattedMessage
                        id='cloud_delinquency.modal.stay_on_freemium'
                        defaultMessage='Stay on Freemium'
                    />
                </button>

                <button
                    className={'DeliquencyModal__footer__update'}
                    id={'inviteMembersButton'}
                    onClick={() => {
                        openPurchaseModal({
                            trackingLocation: '',
                        });
                    }}
                >
                    <FormattedMessage
                        id='cloud_delinquency.modal.update_billing'
                        defaultMessage='Update Billing'
                    />
                </button>
            </Modal.Footer></>}
            {showFreemium && <FreemiumModal onClose={closeModal}/>}
        </Modal>);
};

export default DeliquencyModal;
