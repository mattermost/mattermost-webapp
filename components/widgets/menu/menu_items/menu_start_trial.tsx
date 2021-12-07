// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import {isTrialLicense} from 'utils/license_utils';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';

import StartTrialModal from 'components/start_trial_modal';
import TrialBenefitsModal from 'components/trial_benefits_modal/trial_benefits_modal';

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
        trackEvent(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'open_start_trial_modal',
        );
        dispatch(openModal({
            modalId: ModalIdentifiers.START_TRIAL_MODAL,
            dialogType: StartTrialModal,
        }));
    };

    const openTrialBenefitsModal = () => {
        trackEvent(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'open_trial_benefits_modal_from_menu',
        );
        dispatch(openModal({
            modalId: ModalIdentifiers.TRIAL_BENEFITS_MODAL,
            dialogType: TrialBenefitsModal,
        }));
    };

    const prevTrialLicense = useSelector((state: GlobalState) => state.entities.admin.prevTrialLicense);
    const license = useSelector(getLicense);
    const isPrevLicensed = prevTrialLicense?.IsLicensed;
    const isCurrentLicensed = license?.IsLicensed;

    const isCurrentLicenseTrial = isTrialLicense(license);

    // Show this CTA if the instance is currently not licensed and has never had a trial license loaded before
    const show = (isCurrentLicensed === 'false' && isPrevLicensed === 'false') || isCurrentLicenseTrial;

    if (!show) {
        return null;
    }

    return (
        <li
            className={'MenuStartTrial'}
            role='menuitem'
            id={props.id}
        >
            {isCurrentLicenseTrial ?
                <>
                    <div style={{display: 'inline'}}>
                        <span>
                            {formatMessage({id: 'navbar_dropdown.reviewTrialBenefits', defaultMessage: 'Review the features you get with Enterprise. '})}
                        </span>
                        <button onClick={openTrialBenefitsModal}>
                            {formatMessage({id: 'navbar_dropdown.learnMoreTrialBenefits', defaultMessage: 'Learn More'})}
                        </button>
                    </div>
                </> :
                <>
                    <span>
                        {formatMessage({id: 'navbar_dropdown.tryTrialNow', defaultMessage: 'Try Enterprise for free now!'})}
                    </span>
                    <button onClick={openStartTrialModal}>
                        {formatMessage({id: 'navbar_dropdown.startTrial', defaultMessage: 'Start Trial'})}
                    </button>
                </>
            }
        </li>
    );
};

export default MenuStartTrial;
