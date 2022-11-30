// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {CloudLinks, ModalIdentifiers} from 'utils/constants';
import {closeModal} from 'actions/views/modals';
import CreditCardSvg from 'components/common/svg_images_components/credit_card_svg';

import './content.scss';

export default function AirGappedSelfHostedPurhcaseModal() {
    const dispatch = useDispatch();

    const closeAirGappedModal = () => {
        dispatch(closeModal(ModalIdentifiers.AIR_GAPPED_SELF_HOSTED_PURCHASE));
    };

    return (
        <Modal
            onHide={closeAirGappedModal}
            show={true}
            className='air-gapped-purhcase-modal'
        >
            <Modal.Body>
                <div className='content'>
                    <CreditCardSvg
                        height={350}
                        width={350}
                    />
                    <span id='air-gapped-modal-title'>
                        <FormattedMessage
                            id={'air_gapped_purchase_modal.title.purchase_through_portal'}
                            defaultMessage={'Purchase through the customer portal'}
                        />
                    </span>
                    <span id='air-gapped-modal-content'>
                        <FormattedMessage
                            id={'air_gapped_purchase_modal.content.appear_to_be_air_gapped'}
                            defaultMessage={'It appears that your instance is air-gapped, or it may not be connected to the internet. To purchase a license, please visit'}
                        />
                    </span>
                    <a href={CloudLinks.SELF_HOSTED_PRICING}>{CloudLinks.SELF_HOSTED_PRICING}</a>
                </div>
            </Modal.Body>
        </Modal>
    );
}
