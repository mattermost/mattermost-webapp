// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {Subscription} from '@mattermost/types/cloud';
import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import UpgradeSvg from 'components/common/svg_images_components/upgrade_svg';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {GlobalState} from 'types/store';

import './deliquency_modal.scss';
import {FreemiumModal} from './freemium_modal';

interface DeliquencyModalProps {
    subscription: Subscription;
    onExited: () => void;
    closeModal: () => void;
}

const DeliquencyModal = (props: DeliquencyModalProps) => {
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.DELIQUENCY_MODAL_DOWNGRADE));
    const {subscription, closeModal, onExited} = props;
    const openPurchaseModal = useOpenCloudPurchaseModal({isDelinquencyModal: true});
    const [showFreemium, setShowFremium] = useState(false);

    const handleShowFremium = () => {
        setShowFremium(() => true);
    };

    const handleClose = () => {
        closeModal();
        onExited();
    };

    const handleUpdateBilling = () => {
        handleClose();
        openPurchaseModal({
            trackingLocation: 'deliquency_modal_downgrade_admin',
        });
    };

    return (
        <Modal
            className='DeliquencyModal'
            dialogClassName='a11y__modal'
            show={show}
            onHide={closeModal}
            onExited={closeModal}
            role='dialog'
            id='DeliquencyModal'
            aria-modal='true'
        >
            {!showFreemium &&
            <>
                <Modal.Header className='DeliquencyModal__header '>
                    <button
                        id='closeIcon'
                        className='icon icon-close'
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
                        className={'DeliquencyModal__footer--secondary'}
                        id={'inviteMembersButton'}
                        onClick={handleShowFremium}
                    >
                        <FormattedMessage
                            id='cloud_delinquency.modal.stay_on_freemium'
                            defaultMessage='Stay on Freemium'
                        />
                    </button>

                    <button
                        className={'DeliquencyModal__footer--primary'}
                        id={'inviteMembersButton'}
                        onClick={handleUpdateBilling}
                    >
                        <FormattedMessage
                            id='cloud_delinquency.modal.update_billing'
                            defaultMessage='Update Billing'
                        />
                    </button>
                </Modal.Footer>
            </>}
            {showFreemium && <FreemiumModal onClose={handleClose}/>}
        </Modal>);
};

export default DeliquencyModal;
