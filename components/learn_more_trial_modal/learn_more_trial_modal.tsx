// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo} from 'react';
import {useIntl} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import {TELEMETRY_CATEGORIES} from 'utils/constants';

import Carousel from 'components/common/carousel/carousel';
import GenericModal from 'components/generic_modal';
import GuestAccessSvg from 'components/common/svg_images_components/guest_access_svg';
import PersonMacSvg from 'components/common/svg_images_components/person_mac_svg';
import PushNotificationsSvg from 'components/common/svg_images_components/push_notifications_svg';

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

    useEffect(() => {
        trackEvent(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'learn_more_trial_modal_view',
        );
    }, []);

    const steps: LearnMoreTrialModalStepProps[] = useMemo(() => [
        {
            id: 'guestAccess',
            title: formatMessage({id: 'trial_benefits.modal.guestAccessTitle', defaultMessage: 'Determine user access with Guest Accounts'}),
            description: formatMessage({id: 'trial_benefits.modal.guestAccessDescription', defaultMessage: 'Collaborate with users outside of your organization while tightly controlling their access channels and team members.'}),
            svgWrapperClassName: 'guestAccessSvg',
            svgElement: (
                <GuestAccessSvg
                    width={400}
                    height={180}
                />
            ),
            buttonLabel: formatMessage({id: 'benefits_trial.modal.learnMore', defaultMessage: 'Learn More New!'}),
        },
        {
            id: 'complianceExport',
            title: formatMessage({id: 'trial_benefits.modal.complianceExportTitle', defaultMessage: 'Automate compliance exports'}),
            description: formatMessage({id: 'trial_benefits.modal.complianceExportDescription', defaultMessage: 'Run daily compliance reports and export them to a variety of formats consumable by third-party integration tools such as Smarsh (Actiance).'}),
            svgWrapperClassName: 'personMacSvg',
            svgElement: (
                <PersonMacSvg
                    width={400}
                    height={180}
                />
            ),
            buttonLabel: formatMessage({id: 'benefits_trial.modal.learnMore', defaultMessage: 'Learn More'}),
        },
        {
            id: 'pushNotificationService',
            title: formatMessage({id: 'trial_benefits.modal.pushNotificationServiceTitle', defaultMessage: 'Mobile Secure-ID Push Notifications'}),
            description: formatMessage({id: 'trial_benefits.modal.pushNotificationServiceDescription', defaultMessage: 'ID-only push notification setting offers a high level of privacy while still allowing your team members to benefit from mobile push notifications.'}),
            svgWrapperClassName: 'personBoxSvg',
            svgElement: (
                <PushNotificationsSvg
                    width={400}
                    height={200}
                />
            ),
            buttonLabel: formatMessage({id: 'benefits_trial.modal.learnMore', defaultMessage: 'Learn More'}),
        },
    ], []);

    const handleOnClose = useCallback(() => {
        if (onClose) {
            onClose();
        }

        onExited();
    }, [onClose, onExited]);

    const handleOnPrevNextSlideClick = useCallback((slideIndex: number) => {
        const slideId = steps[slideIndex - 1]?.id;

        if (slideId) {
            trackEvent(
                TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
                'learn_more_trial_modal_slide_shown_' + slideId,
            );
        }
    }, [steps]);

    const getSlides = useMemo(() => steps.map(({id, ...rest}) => (
        <LearnMoreTrialModalStep
            {...rest}
            id={id}
            key={id}
        />
    )), []);

    return (
        <GenericModal
            className='LearnMoreTrialModal'
            id='learnMoreTrialModal'
            onExited={handleOnClose}
        >
            <Carousel
                dataSlides={getSlides}
                id={'learnMoreTrialModalCarousel'}
                infiniteSlide={false}
                onNextSlideClick={handleOnPrevNextSlideClick}
                onPrevSlideClick={handleOnPrevNextSlideClick}
            />
        </GenericModal>
    );
};

export default LearnMoreTrialModal;
