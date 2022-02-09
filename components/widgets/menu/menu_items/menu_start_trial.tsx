// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {ModalIdentifiers, Preferences, TELEMETRY_CATEGORIES, TutorialSteps} from 'utils/constants';
import {isTrialLicense} from 'utils/license_utils';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';

import StartTrialModal from 'components/start_trial_modal';
import {makeAsyncComponent} from 'components/async_load';
import TutorialTip from 'components/tutorial/tutorial_tip';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import './menu_item.scss';

const TrialBenefitsModal = makeAsyncComponent('TrialBenefitsModal', React.lazy(() => import('components/trial_benefits_modal/trial_benefits_modal')));

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

    const tutorialStep = useSelector((state: GlobalState) => getInt(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED));
    const config = useSelector((state: GlobalState) => getConfig(state));
    const enableTutorial = config.EnableTutorial === 'true';
    const showTutorialTip = enableTutorial && tutorialStep === TutorialSteps.START_TRIAL;

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

    const title = (
        <FormattedMessage
            id='start_trial.tutorialTip.title'
            defaultMessage='Try our premium features for free'
        />
    );

    const screen = (
        <p>
            <FormattedMarkdownMessage
                id='start_trial.tutorialTip.desc'
                defaultMessage='Explore our most requested premium features. Determine user access with Guest Accounts, automate compliance reports, and send secure ID-only mobile push notifications.'
            />
        </p>
    );

    let tutorialTip = null;
    if (showTutorialTip) {
        tutorialTip = (
            <TutorialTip
                title={title}
                showOptOut={true}
                stopPropagation={true}
                step={TutorialSteps.START_TRIAL}
                placement='right'
                screen={screen}
                overlayClass='tip-overlay--start-trial'
                telemetryTag='enterprise_trial_upgrade_tour_point_views'
                extraFunc={openStartTrialModal}
                customLastStepButtonText={{id: 'navbar_dropdown.startTrial', defaultMessage: 'Start Trial'}}
            />
        );
    }

    return (
        <li
            className={'MenuStartTrial'}
            role='menuitem'
            id={props.id}
        >
            {isCurrentLicenseTrial ? <>
                <div style={{display: 'inline'}}>
                    <span>
                        {formatMessage({id: 'navbar_dropdown.reviewTrialBenefits', defaultMessage: 'Review the features you get with Enterprise. '})}
                    </span>
                    <button onClick={openTrialBenefitsModal}>
                        {formatMessage({id: 'navbar_dropdown.learnMoreTrialBenefits', defaultMessage: 'Learn More'})}
                    </button>
                </div>
            </> : <>
                <div className='start_trial_content'>
                    {formatMessage({id: 'navbar_dropdown.tryTrialNow', defaultMessage: 'Try Enterprise for free now!'})}
                    {tutorialTip}
                </div>
                <button onClick={openStartTrialModal}>
                    {formatMessage({id: 'navbar_dropdown.startTrial', defaultMessage: 'Start Trial'})}
                </button>
            </>
            }
        </li>
    );
};

export default MenuStartTrial;
