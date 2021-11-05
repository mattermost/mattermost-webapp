// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {Modal, Button} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {trackEvent, pageVisited} from 'actions/telemetry_actions';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import PurchaseModal from 'components/purchase_modal';
import NotifyLink from 'components/widgets/links/notify_link';
import ConfirmNotifyAdminModal from 'components/confirm_notify_admin_modal';

import {ModalData} from 'types/actions';

import UpgradeUserLimitModalSvg from './user_limit_upgrade_svg';

import './user_limit_modal.scss';

type Props = {
    userIsAdmin: boolean;
    show: boolean;
    cloudUserLimit: string;
    actions: {
        closeModal: (identifier: string) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
};

export default function UserLimitModal(props: Props): JSX.Element {
    const [notificationProcessDone, setNotificationProcessDoneStatus] = useState(false);
    useEffect(() => {
        pageVisited(
            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
            'pageview_modal_user_limit_reached',
        );
    }, []);

    useEffect(() => {
        if (notificationProcessDone === true) {
            props.actions.closeModal(ModalIdentifiers.UPGRADE_CLOUD_ACCOUNT);
            props.actions.openModal({
                modalId: ModalIdentifiers.CONFIRM_NOTIFY_ADMIN,
                dialogType: ConfirmNotifyAdminModal,
            });
        }
    }, [notificationProcessDone]);

    const onSubmit = () => {
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
            'click_modal_user_limit_upgrade',
        );
        props.actions.closeModal(ModalIdentifiers.UPGRADE_CLOUD_ACCOUNT);
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
        props.actions.closeModal(ModalIdentifiers.UPGRADE_CLOUD_ACCOUNT);
    };

    const confirmBtn = props.userIsAdmin ? (
        <Button
            className='confirm-button'
            onClick={onSubmit}
        >
            <FormattedMessage
                id={'upgrade.cloud'}
                defaultMessage={'Upgrade Mattermost Cloud'}
            />
        </Button>
    ) : (<NotifyLink
        extraFunc={() => setNotificationProcessDoneStatus(true)}
        className='confirm-button'
    // eslint-disable-next-line react/jsx-closing-bracket-location
    />);

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
                                    'The free tier is limited to {num} users. Upgrade Mattermost Cloud for more users.'
                                }
                                values={{
                                    num: props.cloudUserLimit,
                                }}
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
                            {confirmBtn}
                        </div>
                    </Modal.Body>
                </Modal>
            )}
        </>
    );
}
