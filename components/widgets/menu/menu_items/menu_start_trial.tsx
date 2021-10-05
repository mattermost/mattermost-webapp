// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {ModalIdentifiers} from 'utils/constants';
import {openModal} from 'actions/views/modals';
import StartTrialModal from 'components/start_trial_modal';
import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';

import './menu_item.scss';

type Props = {
    id: string;
}

const MenuStartTrial = (props: Props): JSX.Element | null => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPrevTrialLicense());
    }, []);

    const openStartTrialModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.START_TRIAL_MODAL,
            dialogType: StartTrialModal,
        }));
    };

    const prevTrialLicense = useSelector((state: GlobalState) => state.entities.admin.prevTrialLicense);
    const currentLicense = useSelector(getLicense);
    const isPrevLicensed = prevTrialLicense?.IsLicensed;
    const isCurrentLicensed = currentLicense?.IsLicensed;

    // Show this CTA if the instance is currently not licensed and has never had a trial license loaded before
    const show = (isCurrentLicensed === 'false') && (isPrevLicensed === 'false');

    if (!show) {
        return null;
    }

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
