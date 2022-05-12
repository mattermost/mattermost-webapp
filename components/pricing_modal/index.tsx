// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';

import {isModalOpen} from 'selectors/views/modals';
import {closeModal} from 'actions/views/modals';
import {GlobalState} from 'types/store';
import {ModalIdentifiers} from 'utils/constants';

import Content from './content';

import './pricing_modal.scss';

function PricingModal() {
    const dispatch = useDispatch();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.PRICING_MODAL));

    return (
        <Modal
            className='PreTrialPricingModal'
            show={show}
            id='preTrialPricingModal'
            onExited={() => {}}
            data-testid='preTrialPricingModal'
            dialogClassName='a11y__modal'
            onHide={() => {
                dispatch(closeModal(ModalIdentifiers.PRICING_MODAL));
            }}
            role='dialog'
            aria-modal='true'
            aria-labelledby='pre_trial_pricing_modal_title'
        >
            <Content
                onHide={() => {
                    dispatch(closeModal(ModalIdentifiers.PRICING_MODAL));
                }}
            />

        </Modal>
    );
}

export default PricingModal;
