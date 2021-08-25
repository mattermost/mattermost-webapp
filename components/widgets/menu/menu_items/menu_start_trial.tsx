// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {ModalIdentifiers} from 'utils/constants';
import {openModal} from 'actions/views/modals';
import StartTrialModal from 'components/start_trial_modal';

import './menu_item.scss';

type Props = {
    id: string;
    show: boolean;
}

const MenuStartTrial = (props: Props): JSX.Element | null => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const openStartTrialModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.START_TRIAL_MODAL,
            dialogType: StartTrialModal,
        }));
    };

    // if (!props.show) {
    //     return null;
    // }

    return (
        <li
            className={'MenuStartTrial'}
            role='menuitem'
            id={props.id}
        >
            <span>{formatMessage({id: 'navbar_dropdown.tryTrialNow', defaultMessage: 'Try Enterprise for free now!'})}</span>
            <button onClick={openStartTrialModal}>{formatMessage({id: 'navbar_dropdown.startTrial', defaultMessage: 'Start Trial'})}</button>
        </li>
    );
};

export default MenuStartTrial;
