// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Modal} from 'react-bootstrap';

import Content from './content';

import './pricing_modal.scss';

function PricingModal() {
    const [show, setShow] = React.useState(true);
    return (
        <Modal
            className='PreTrialPricingModal'
            show={show}
            id='preTrialPricingModal'
            onExited={() => {
                setShow(true);
            }}
            data-testid='preTrialPricingModal'
            dialogClassName='a11y__modal'
            onHide={() => {
                setShow(false);
            }}
            role='dialog'
            aria-modal='true'
            aria-labelledby='pre_trial_pricing_modal_title'
        >
            <Content/>

        </Modal>
    );
}

export default PricingModal;
