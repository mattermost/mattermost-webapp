// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';

import {ConsolePages, ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';

import Carousel from 'components/common/carousel/carousel';
import GenericModal from 'components/generic_modal';
import GuestAccessSvg from 'components/common/svg_images_components/guest_access_svg';
import LaptopSvg from 'components/common/svg_images_components/laptop_svg';
import SystemRolesSVG from 'components/admin_console/feature_discovery/features/images/system_roles_svg';
import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';
import {BtnStyle} from 'components/common/carousel/carousel_button';

import {closeModal} from 'actions/views/modals';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import StartTrialBtn from './start_trial_btn';

import LearnMoreTrialModalStep, {LearnMoreTrialModalStepProps} from './learn_more_trial_modal_step';

import './learn_more_trial_modal.scss';

type Props = {
    onClose?: () => void;
    onExited: () => void;
}

const LearnMoreTrialModal = (
    {
        onClose,
        onExited,
    }: Props): JSX.Element | null => {
    const {formatMessage} = useIntl();
    const [embargoed, setEmbargoed] = useState(false);
    const dispatch = useDispatch<DispatchFunc>();

    // Cloud conditions
    const license = useSelector(getLicense);
    const isCloud = license?.Cloud === 'true';
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const isCloudFree = isCloud && isCloudFreeEnabled;

    const handleEmbargoError = useCallback(() => {
        setEmbargoed(true);
    }, []);

    let startTrialBtnMsg = formatMessage({id: 'start_trial.modal_btn.start_free_trial', defaultMessage: 'Start free 30-day trial'});

    // close this modal once start trial btn is clicked and trial has started successfully
    const dismissAction = () => {
        dispatch(closeModal(ModalIdentifiers.LEARN_MORE_TRIAL_MODAL));
    };

    let startTrialBtn = (
        <StartTrialBtn
            message={startTrialBtnMsg}
            handleEmbargoError={handleEmbargoError}
            telemetryId='start_trial_from_learn_more_about_trial_modal'
            onClick={dismissAction}
        />
    );

    // no need to check if is cloud trial or if it have had prev cloud trial cause the button that show this modal takes care of that
    if (isCloudFree) {
        startTrialBtnMsg = formatMessage({id: 'menu.cloudFree.tryFreeFor30Days', defaultMessage: 'Try free for 30 days'});
        startTrialBtn = (
            <CloudStartTrialButton
                message={startTrialBtnMsg}
                telemetryId={'start_cloud_trial_from_learn_more_about_trial_modal'}
                onClick={dismissAction}
                extraClass={'btn btn-primary start-cloud-trial-btn'}
            />
        );
    }

    const handleOnClose = useCallback(() => {
        if (onClose) {
            onClose();
        }

        onExited();
    }, [onClose, onExited]);

    useEffect(() => {
        trackEvent(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'learn_more_trial_modal_view',
        );
    }, []);

    const buttonLabel = formatMessage({id: 'learn_more_trial_modal_step.learnMoreAboutFeature', defaultMessage: 'Learn more about this feature.'});

    const steps: LearnMoreTrialModalStepProps[] = useMemo(() => [
        {
            id: 'useSso',
            title: formatMessage({id: 'learn_more_about_trial.modal.useSsoTitle', defaultMessage: 'Use SSO (with OpenID, SAML, Google, 0365)'}),
            description: formatMessage({id: 'learn_more_about_trial.modal.useSsoDescription', defaultMessage: 'Sign on quickly and easily with our SSO feature that works with OpenID, SAML, Google, and 0365.'}),
            svgWrapperClassName: 'guestAccessSvg',
            svgElement: (
                <GuestAccessSvg
                    width={400}
                    height={180}
                />
            ),
            pageURL: ConsolePages.GUEST_ACCOUNTS,
            buttonLabel,
            handleOnClose,
        },
        {
            id: 'ldap',
            title: formatMessage({id: 'learn_more_about_trial.modal.ldapTitle', defaultMessage: 'Synchronize your Active Directory/LDAP groups'}),
            description: formatMessage({id: 'learn_more_about_trial.modal.ldapDescription', defaultMessage: 'Run daily compliance reports and export them to a variety of formats consumable by third-party integration tools such as Smarsh (Actiance).'}),
            svgWrapperClassName: 'personMacSvg',
            svgElement: (
                <LaptopSvg/>
            ),
        },
        {
            id: 'systemConsole',
            title: formatMessage({id: 'learn_more_about_trial.modal.systemConsoleTitle', defaultMessage: 'Provide controlled access to the System Console'}),
            description: formatMessage({id: 'learn_more_about_trial.modal.systemConsoleDescription', defaultMessage: 'Use System Roles to give designated users read and/or write access to select sections of System Console.'}),
            svgWrapperClassName: 'personBoxSvg',
            svgElement: (
                <SystemRolesSVG
                    width={400}
                    height={200}
                />
            ),
            pageURL: ConsolePages.LICENSE,
            buttonLabel,
            handleOnClose,
        },
    ], []);

    const handleOnPrevNextSlideClick = useCallback((slideIndex: number) => {
        const slideId = steps[slideIndex - 1]?.id;

        if (slideId) {
            trackEvent(
                TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
                'learn_more_trial_modal_slide_shown_' + slideId,
            );
        }
    }, [steps]);

    const getSlides = useMemo(
        () =>
            steps.map(({id, ...rest}) => (
                <LearnMoreTrialModalStep
                    {...rest}
                    id={id}
                    key={id}
                />
            )),
        [],
    );

    const headerText = formatMessage({id: 'learn_more_trial_modal.pretitle', defaultMessage: 'With Enterprise, you can...'});

    return (
        <GenericModal
            className='LearnMoreTrialModal'
            id='learnMoreTrialModal'
            onExited={handleOnClose}
            modalHeaderText={headerText}
        >
            <Carousel
                dataSlides={getSlides}
                id={'learnMoreTrialModalCarousel'}
                infiniteSlide={false}
                onNextSlideClick={handleOnPrevNextSlideClick}
                onPrevSlideClick={handleOnPrevNextSlideClick}
                disableNextButton={embargoed}
                style={BtnStyle.CHEVRON}
                actionButton={startTrialBtn}
            />
        </GenericModal>
    );
};

export default LearnMoreTrialModal;
