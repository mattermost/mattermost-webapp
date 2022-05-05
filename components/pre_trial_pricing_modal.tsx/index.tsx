// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Modal} from 'react-bootstrap';

import Content from './content';

import './pre_trial_pricing_modal.scss';

function PreTrialPricingModal() {
    return (
        <Modal
            className='PreTrialPricingModal'
            show={true}
            id='preTrialPricingModal'
            onExited={() => {}}
            data-testid='preTrialPricingModal'
            dialogClassName='a11y__modal'
            onHide={() => {}}
            role='dialog'
            aria-modal='true'
            aria-labelledby='pre_trial_pricing_modal_title'
        >
            <Content/>

        </Modal>
    );
}

export default PreTrialPricingModal;
