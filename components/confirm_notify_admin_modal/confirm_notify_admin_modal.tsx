// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Button, Modal} from 'react-bootstrap';

import {FormattedMessage} from 'react-intl';

import ConfirmNotifyAdminModalSvg from './confirm_notify_admin.svg';

import './confirm_notify_admin_modal.scss';

type Props = {
    show: boolean;
    actions: {
        closeModal: () => void;
    };
};

const ConfirmNotifyAdminModal = (props: Props): JSX.Element => {
    return (
        <>
            <Modal
                className={'ConfirmNotifyAdminModal'}
                show={props.show}
                id='confirmNotifyAdminModal'
                role='dialog'
                onHide={props.actions.closeModal}
            >
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    <ConfirmNotifyAdminModalSvg/>
                    <div className='title'>
                        <FormattedMessage
                            id={'confirm.notification_sent_to_admin.modal_title'}
                            defaultMessage={'Thank you!'}
                        />
                    </div>
                    <div className='description'>
                        <FormattedMessage
                            id={'confirm.notification_sent_to_admin.modal_body'}
                            defaultMessage={'A notification has been sent to your administrator.'}
                        />
                    </div>
                    <div className='buttons'>
                        <Button
                            className='confirm-button'
                            onClick={props.actions.closeModal}
                        >
                            <FormattedMessage
                                id={'confirm.notification_sent_to_admin.modal_done'}
                                defaultMessage={'Done'}
                            />
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ConfirmNotifyAdminModal;
