// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal, Button} from 'react-bootstrap';

import upgradeImage from './user_limit_upgrade.svg';

import './user_limit_modal.scss';

type Props = {
    show: boolean;
    onClose: () => void;
    onSubmit: () => void;
};

export default function ContactUsModal(props: Props) {
    return (
        <Modal
            className={'UserLimitModal'}
            dialogClassName='a11y__modal'
            show={props.show}
            id='contactUsModal'
            role='dialog'
            aria-modal={true}
            aria-labelledby='contactUsTitle'
            aria-describedby='contacUsBody'
        >
            <Modal.Header closeButton={true}/>
            <Modal.Body id='contacSalesBody'>
                <img
                    className='upgrade-image'
                    src={upgradeImage}
                />
                <div className='title'>{"You've reached the user limit"}</div>
                <div className='description'>
                    {
                        'The free tier is limited to 10 users. Upgrade Mattermost Cloud for more users.'
                    }
                </div>
                <div className='buttons'>
                    <Button
                        className='dismiss-link'
                        variant='link'
                        onClick={props.onClose}
                    >
                        {'Not right now'}
                    </Button>
                    <Button
                        className='confirm-button'
                        variant='primary'
                        onClick={props.onSubmit}
                    >{'Upgrade Mattermost Cloud'}</Button>{' '}
                </div>
            </Modal.Body>
        </Modal>
    );
}
