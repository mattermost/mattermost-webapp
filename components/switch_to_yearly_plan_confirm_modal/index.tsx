// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {FormattedMessage} from 'react-intl';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'types/store';

import {isModalOpen} from 'selectors/views/modals';

import GenericModal from 'components/generic_modal';
import AlertSvg from 'components/common/svg_images_components/upgrade_svg';

import {ModalIdentifiers} from 'utils/constants';

import {closeModal} from 'actions/views/modals';

import './switch_to_yearly_plan_confirm_modal.scss';

type Props = {
    contactSalesFunc: () => void;
    confirmSwitchToYearlyFunc: () => void;
}

const SwitchToYearlyPlanConfirmModal: React.FC<Props> = (props: Props): JSX.Element | null => {
    const dispatch = useDispatch<DispatchFunc>();

    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.CONFIRM_SWITCH_TO_YEARLY));
    if (!show) {
        return null;
    }

    const handleConfirmSwitch = () => {
        dispatch(closeModal(ModalIdentifiers.CONFIRM_SWITCH_TO_YEARLY));
        props.confirmSwitchToYearlyFunc();
    };

    return (
        <GenericModal
            className={'SwitchToYearlyPlanConfirmModal'}
            show={show}
            id='SwitchToYearlyPlanConfirmModal'
            onExited={() => dispatch(closeModal(ModalIdentifiers.CONFIRM_SWITCH_TO_YEARLY))}
        >
            <>
                <div className='content-body'>
                    <div className='alert-svg'>
                        <AlertSvg
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
                            defaultMessage='Changing to the Yearly plan is irreversible. Are you sure you want to switch from monthly to the yearly plan?'
                        />
                    </div>
                    <div className='subtitle'>
                        <FormattedMessage
                            id='confirm_switch_to_yearly_modal.subtitle2'
                            defaultMessage='For more information, please contact sales.'
                        />
                    </div>
                </div>
                <div className='content-footer'>
                    <button
                        onClick={props.contactSalesFunc}
                        className='btn light-blue-btn'
                    >
                        <FormattedMessage
                            id='confirm_switch_to_yearly_modal.contact_sales'
                            defaultMessage='Contact Sales'
                        />
                    </button>
                    <button
                        onClick={handleConfirmSwitch}
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='confirm_switch_to_yearly_modal.confirm'
                            defaultMessage='Confirm'
                        />
                    </button>
                </div>
            </>
        </GenericModal>
    );
};

export default SwitchToYearlyPlanConfirmModal;
