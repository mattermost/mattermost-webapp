// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';

import PaymentSuccessStandardSvg from 'components/common/svg_images_components/payment_success_standard_svg';

import IconMessage from 'components/purchase_modal/icon_message';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';

import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';

import './success_modal.scss';

type Props = {
    onHide?: () => void;
};

export default function DeleteWorkspaceSuccessModal(props: Props) {
    const dispatch = useDispatch();
    const subscriptionProduct = useSelector(getSubscriptionProduct);

    const isSuccessModalOpen = useSelector((state: GlobalState) =>
        isModalOpen(state, ModalIdentifiers.SUCCESS_MODAL),
    );

    const onHide = () => {
        dispatch(closeModal(ModalIdentifiers.SUCCESS_MODAL));
        if (typeof props.onHide === 'function') {
            props.onHide();
        }
    };

    const handleGoToMattermost = () => {
        window.open('https://mattermost.com/', '_blank');
    }

    return (
        <FullScreenModal
            show={isSuccessModalOpen}
            onClose={onHide}
        >
            <div className='cloud_subscribe_result_modal'>
                <IconMessage
                    formattedTitle={
                        <FormattedMessage
                            defaultMessage={
                                'Your workspace has been deleted'
                            }
                            id={
                                'admin.billing.delete_workspace.success_modal.title'
                            }
                        />
                    }
                    formattedSubtitle={
                        <FormattedMessage
                            id={'admin.billing.delete_workspace.success_modal.subtitle'}
                            defaultMessage={
                                'Your workspace has now been deleted. Thank you for being a customer. '
                            }
                            values={{plan: subscriptionProduct?.name}}
                        />
                    }
                    error={false}
                    icon={
                        <PaymentSuccessStandardSvg
                            width={444}
                            height={313}
                        />
                    }
                    formattedButtonText={
                        <FormattedMessage
                            defaultMessage={'Go to Mattermost.com'}
                            id={'success_modal.go_to_mattermost'}
                        />
                    }
                    buttonHandler={handleGoToMattermost}
                    className={'success'}
                />
            </div>
        </FullScreenModal>
    );
}
