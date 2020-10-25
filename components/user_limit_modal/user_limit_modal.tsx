// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {Modal, Button} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {trackEvent, pageVisited} from 'actions/telemetry_actions';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import PurchaseModal from 'components/purchase_modal';

import UpgradeUserLimitModalSvg from './user_limit_upgrade_svg';
import './user_limit_modal.scss';

type Props = {
    show: boolean;
    actions: {
        closeModal: () => void;
        openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => void;
    };
};

export default function UserLimitModal(props: Props) {
    useEffect(() => {
        pageVisited(
            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
            'pageview_modal_user_limit_reached',
        );
    }, []);

    const onSubmit = () => {
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
            'click_modal_user_limit_upgrade',
        );
        props.actions.closeModal();
        props.actions.openModal({
            modalId: ModalIdentifiers.CLOUD_PURCHASE,
            dialogType: PurchaseModal,
        });
    };

    const close = () => {
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
            'click_modal_user_limit_not_now',
        );
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
