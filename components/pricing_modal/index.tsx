// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';

// import {isModalOpen} from 'selectors/views/modals';
import {closeModal} from 'actions/views/modals';
// import {GlobalState} from 'types/store';
import {ModalIdentifiers} from 'utils/constants';

import Content from './content';

import './pricing_modal.scss';

function PricingModal() {
    const [showModal, setShowModal] = useState(true);
    const dispatch = useDispatch();
    // const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.PRICING_MODAL));

    return (
        <Modal
            className='PricingModal'

            // show={show}
            show={showModal}
            id='pricingModal'
            onExited={() => {
                dispatch(closeModal(ModalIdentifiers.PRICING_MODAL));
            }}
            data-testid='pricingModal'
            dialogClassName='a11y__modal'
            onHide={() => {
                setShowModal(false);
            }}
            role='dialog'
            aria-modal='true'
            aria-labelledby='pricing_modal_title'
        >
            <Content
                onHide={() => {
                    setShowModal(false);
                }}
            />

        </Modal>
    );
}

export default PricingModal;
