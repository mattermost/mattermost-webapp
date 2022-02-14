// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import moment from 'moment';

import {trackEvent} from 'actions/telemetry_actions';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';

import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';

import Carousel from 'components/common/carousel/carousel';
import GenericModal from 'components/generic_modal';
import HandsSvg from 'components/common/svg_images_components/hands_svg';
import GuestAccessSvg from 'components/common/svg_images_components/guest_access_svg';
import PersonMacSvg from 'components/common/svg_images_components/person_mac_svg';
import PushNotificationsSvg from 'components/common/svg_images_components/push_notifications_svg';

import TrialBenefitsModalStep, {TrialBenefitsModalStepProps} from './trial_benefits_modal_step';

import './trial_benefits_modal.scss';

type Props = {
    onClose?: () => void;
    onExited: () => void;
    trialJustStarted?: boolean;
}

const ConsolePages = {
    GUEST_ACCESS: '/admin_console/authentication/guest_access',
    COMPLIANCE_EXPORT: '/admin_console/compliance/export',
    PUSH_NOTIFICATION_CENTER: '/admin_console/environment/push_notification_server',
};

const TrialBenefitsModal = (
    {
        onClose,
        onExited,
        trialJustStarted,
    }: Props): JSX.Element | null => {
    const {formatMessage} = useIntl();

    const license = useSelector((state: GlobalState) => getLicense(state));
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.TRIAL_BENEFITS_MODAL));

    if (!show) {
        return null;
    }

    useEffect(() => {
        if (!trialJustStarted) {
            trackEvent(
                TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
                'benefits_modal_post_enterprise_view',
            );
        }
    }, []);

    // by default all licence last 30 days plus 8 hours. We use this value as a fallback for the trial license duration information shown in the modal
    const trialLicenseDuration = (1000 * 60 * 60 * 24 * 30) + (1000 * 60 * 60 * 8);
    const trialEndDate = moment.unix((Number(license?.ExpiresAt) || new Date(Date.now()).getTime() + trialLicenseDuration) / 1000).format('DD/MM/YYYY');

    const steps: TrialBenefitsModalStepProps[] = useMemo(() => [
        {
            id: trialJustStarted ? 'trialStart' : 'postTrialStart',
            title: trialJustStarted ?
                formatMessage({id: 'trial_benefits.modal.trialStarttitle', defaultMessage: 'Your trial has started! Explore the benefits of Enterprise'}) :
                formatMessage({id: 'trial_benefits.modal.postTrialStarttitle', defaultMessage: 'You are on the Enterprise plan! Explore the benefits of Enterprise'}),
            description: trialJustStarted ?
                formatMessage(
                    {
                        id: 'trial_benefits.modal.trialStartDescription',
                        defaultMessage: 'Welcome to your Mattermost Enterprise trial! It expires on {trialExpirationDate}. Until then, enjoy the following benefits of Enterprise:',
                    },
                    {trialExpirationDate: trialEndDate},
                ) :
                formatMessage(
                    {
                        id: 'trial_benefits.modal.postTrialStartDescription',
                        defaultMessage: 'Welcome to Enterprise! Your plan expires on {trialExpirationDate}. Until then, enjoy the following benefits of Enterprise:',
                    },
                    {trialExpirationDate: trialEndDate},
                ),
            svgWrapperClassName: 'handsSvg',
            svgElement: (
                <HandsSvg
                    width={200}
                    height={100}
                />
            ),
            bottomLeftMessage: formatMessage({id: 'trial_benefits.modal.onlyVisibleToAdmins', defaultMessage: 'Only visible to admins'}),
        },
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
            pageURL: ConsolePages.GUEST_ACCESS,
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
            pageURL: ConsolePages.COMPLIANCE_EXPORT,
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
            pageURL: ConsolePages.PUSH_NOTIFICATION_CENTER,
        },
    ], [trialJustStarted, trialEndDate]);

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
                'benefits_modal_slide_shown_' + slideId,
            );
        }
    }, [steps]);

    const getSlides = useCallback(() => steps.map(({id, ...rest}) => (
        <TrialBenefitsModalStep
            {...rest}
            id={id}
            key={id}
            onClose={handleOnClose}
        />
    )), [steps, handleOnClose]);

    return (
        <GenericModal
            className='TrialBenefitsModal'
            show={show}
            id='trialBenefitsModal'
            onExited={handleOnClose}
        >
            <Carousel
                dataSlides={getSlides()}
                id={'trialBenefitsModalCarousel'}
                infiniteSlide={false}
                onNextSlideClick={handleOnPrevNextSlideClick}
                onPrevSlideClick={handleOnPrevNextSlideClick}
            />
        </GenericModal>
    );
};

export default TrialBenefitsModal;
