// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal, Button} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import UpgradeUserLimitModalSvg from './user_limit_upgrade_svg';
import './user_limit_modal.scss';

type Props = {
    show: boolean;
    actions: {
        closeModal: () => void;
    };
};

export default function UserLimitModal(props: Props) {
    const onSubmit = () => {
        // This does nothing until implementation of the upgrade tier page is complete
        // Eventually, we will dispatch props.actions.openModal here
    };

    const close = () => {
        props.actions.closeModal();
    };

    return (
        <>
            {props.show && (
                <Modal
                    className={'UserLimitModal'}
                    show={props.show}
                    id='userLimitModal'
                    role='dialog'
                    onHide={close}
                >
                    <Modal.Header closeButton={true}/>
                    <Modal.Body>
                        <UpgradeUserLimitModalSvg/>
                        <div className='title'>
                            <FormattedMessage
                                id={'upgrade.cloud_modal_title'}
                                defaultMessage={"You've reached the user limit\""}
                            />
                        </div>
                        <div className='description'>
                            <FormattedMessage
                                id={'upgrade.cloud_modal_body'}
                                defaultMessage={
                                    'The free tier is limited to 10 users. Upgrade Mattermost Cloud for more users.'
                                }
                            />
                        </div>
                        <div className='buttons'>
                            <Button
                                className='dismiss-link'
                                onClick={close}
                            >
                                <FormattedMessage
                                    id={'cloud.upgrade.notrightnow'}
                                    defaultMessage={'Not right now'}
                                />
                            </Button>
                            <Button
                                className='confirm-button'
                                onClick={onSubmit}
                            >
                                <FormattedMessage
                                    id={'upgrade.cloud'}
                                    defaultMessage={'Upgrade Mattermost Cloud'}
                                />
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
            )}
        </>
    );
}
