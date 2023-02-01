// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {FormattedMessage, useIntl} from 'react-intl';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'types/store';

import {isModalOpen} from 'selectors/views/modals';

import GenericModal from 'components/generic_modal';
import Svg from 'components/common/svg_images_components/woman_credit_card_and_laptop_svg';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';

import {closeModal} from 'actions/views/modals';
import {trackEvent} from 'actions/telemetry_actions';

import './switch_to_yearly_plan_confirm_modal.scss';

type Props = {
    contactSalesFunc: () => void;
    confirmSwitchToYearlyFunc: () => void;
}

const SwitchToYearlyPlanConfirmModal: React.FC<Props> = (props: Props): JSX.Element | null => {
    const dispatch = useDispatch<DispatchFunc>();
    const {formatMessage} = useIntl();

    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.CONFIRM_SWITCH_TO_YEARLY));
    if (!show) {
        return null;
    }

    const handleConfirmSwitch = () => {
        dispatch(closeModal(ModalIdentifiers.CONFIRM_SWITCH_TO_YEARLY));
        props.confirmSwitchToYearlyFunc();
    };

    const handleClose = () => {
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_ADMIN,
            'confirm_switch_to_annual_click_close_modal',
        );
        dispatch(closeModal(ModalIdentifiers.CONFIRM_SWITCH_TO_YEARLY));
    };

    return (
        <GenericModal
            className={'SwitchToYearlyPlanConfirmModal'}
            show={show}
            id='SwitchToYearlyPlanConfirmModal'
            onExited={handleClose}
            compassDesign={true}
            cancelButtonText={formatMessage({id: 'confirm_switch_to_yearly_modal.contact_sales', defaultMessage: 'Contact Sales'})}
            confirmButtonText={formatMessage({id: 'confirm_switch_to_yearly_modal.confirm', defaultMessage: 'Confirm'})}
            handleCancel={props.contactSalesFunc}
            handleConfirm={handleConfirmSwitch}
        >
            <>
                <div className='content-body'>
                    <div className='alert-svg'>
                        <Svg
                            width={300}
                            height={300}
                        />
                    </div>
                    <div className='title'>
                        <FormattedMessage
                            id='confirm_switch_to_yearly_modal.title'
                            defaultMessage='Confirm switch to annual plan'
                        />
                    </div>
                    <div className='subtitle'>
                        <FormattedMessage
                            id='confirm_switch_to_yearly_modal.subtitle'
                            defaultMessage='Changing to the annual plan is irreversible. Are you sure you want to switch from monthly to the annual plan?'
                        />
                    </div>
                    <div className='sales-info'>
                        <FormattedMessage
                            id='confirm_switch_to_yearly_modal.subtitle2'
                            defaultMessage='For more information, please contact sales.'
                        />
                    </div>
                </div>
            </>
        </GenericModal>
    );
};

export default SwitchToYearlyPlanConfirmModal;
