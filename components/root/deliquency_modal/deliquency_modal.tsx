// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {Fragment, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import CompassThemeProvider from 'components/compass_theme_provider/compass_theme_provider';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import UpgradeSvg from 'components/common/svg_images_components/upgrade_svg';
import {trackEvent} from 'actions/telemetry_actions';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers, Preferences, TELEMETRY_CATEGORIES} from 'utils/constants';
import {GlobalState} from 'types/store';

import './deliquency_modal.scss';
import {FreemiumModal} from './freemium_modal';

interface DeliquencyModalProps {
    planName: string;
    onExited: () => void;
    closeModal: () => void;
    isAdminConsole?: boolean;
}

const DeliquencyModal = (props: DeliquencyModalProps) => {
    const dispatch = useDispatch();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.DELIQUENCY_MODAL_DOWNGRADE));
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const {closeModal, onExited, planName, isAdminConsole} = props;
    const openPurchaseModal = useOpenCloudPurchaseModal({isDelinquencyModal: true});
    const theme = useSelector(getTheme);
    const [showFreemium, setShowFremium] = useState(false);

    const handleShowFremium = () => {
        trackEvent(TELEMETRY_CATEGORIES.CLOUD_DELINQUENCY, 'clicked_stay_on_freemium');
        setShowFremium(() => true);
        dispatch(savePreferences(currentUser.id, [{
            category: Preferences.DELIQUENCY_MODAL_CONFIRMED,
            name: ModalIdentifiers.DELIQUENCY_MODAL_DOWNGRADE,
            user_id: currentUser.id,
            value: 'stayOnFremium',
        }]));
    };

    const handleClose = () => {
        closeModal();
        onExited();
    };

    const handleUpdateBilling = () => {
        handleClose();
        trackEvent(TELEMETRY_CATEGORIES.CLOUD_DELINQUENCY, 'clicked_update_billing');
        openPurchaseModal({
            trackingLocation: 'deliquency_modal_downgrade_admin',
        });
        dispatch(savePreferences(currentUser.id, [{
            category: Preferences.DELIQUENCY_MODAL_CONFIRMED,
            name: ModalIdentifiers.DELIQUENCY_MODAL_DOWNGRADE,
            user_id: currentUser.id,
            value: 'updateBilling',
        }]));
    };

    const ModalJSX = (
        <Modal
            className='DeliquencyModal'
            dialogClassName='a11y__modal'
            show={show}
            onHide={handleClose}
            onExited={handleClose}
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
                        onClick={handleClose}
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
                        defaultMessage='Due to payment issues on your {paidPlan}, your workspace has been downgraded to the free plan. To access {paidPlan} features again, update your billing information now.'
                        values={{
                            paidPlan: planName, // Pasar de productId a Nombre del producto
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
            {showFreemium &&
            <FreemiumModal
                planName={planName}
                onClose={handleClose}
            />}
        </Modal>);

    if (isAdminConsole) {
        return ModalJSX;
    }

    return (<CompassThemeProvider theme={theme}>
        {ModalJSX}
    </CompassThemeProvider>);
};

export default DeliquencyModal;
