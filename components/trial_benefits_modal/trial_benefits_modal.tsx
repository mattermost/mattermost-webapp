// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {useHistory} from 'react-router-dom';

import moment from 'moment';

import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';

import {isModalOpen} from 'selectors/views/modals';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';

import {trackEvent} from 'actions/telemetry_actions';

import Carousel from 'components/common/carousel/carousel';
import GenericModal from 'components/generic_modal';
import HandsSvg from 'components/common/svg_images_components/hands_svg';
import LdapSvg from 'components/common/svg_images_components/ldap_svg';
import PersonWithBoxSvg from 'components/common/svg_images_components/person_with_box_svg';
import PersonMacSvg from 'components/common/svg_images_components/person_mac_svg';
import PersonWithServersSvg from 'components/common/svg_images_components/person_with_servers_svg';
import PersonWithSheetSvg from 'components/common/svg_images_components/person_with_sheet_svg';

import './trial_benefits_modal.scss';

type Props = {
    onClose?: () => void;
    onExited: () => void;
    trialJustStarted?: boolean;
}

const ConsolePages = {
    LDAP: '/admin_console/authentication/ldap',
    DATA_RETENTION: '/admin_console/compliance/data_retention_settings',
    COMPLIANCE_EXPORT: '/admin_console/compliance/export',
    SAML: '/admin_console/authentication/saml',
    CUSTOM_TERMS: '/admin_console/compliance/custom_terms_of_service',
};

const TrialBenefitsModal: React.FC<Props> = (props: Props): JSX.Element | null => {
    const steps = [];
    const license = useSelector((state: GlobalState) => getLicense(state));

    const {formatMessage} = useIntl();

    const history = useHistory();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.TRIAL_BENEFITS_MODAL));
    if (!show) {
        return null;
    }

    const handleOnClose = () => {
        if (props.onClose) {
            props.onClose();
        }
        props.onExited();
    };

    const redirectToConsolePage = (route: string) => {
        history.push(route);
        handleOnClose();

        const lastSection = route.split('/').pop();
        trackEvent(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'benefits_modal_section_opened_' + lastSection,
        );
    };

    const learnMoreText = formatMessage({id: 'benefits_trial.modal.learnMore', defaultMessage: 'Learn More'});

    // by default all licence last 30 days plus 8 hours. We use this value as a fallback for the trial license duration information shown in the modal
    const trialLicenseDuration = (1000 * 60 * 60 * 24 * 30) + (1000 * 60 * 60 * 8);
    const trialEndDate = moment.unix((Number(license?.ExpiresAt) || new Date(Date.now()).getTime() + trialLicenseDuration) / 1000).format('DD/MM/YYYY');

    const trialStartSlide = (
        <div className='slide-container'>
            {props.trialJustStarted ?
                <div className='title'>
                    {formatMessage({id: 'trial_benefits.modal.trialStarttitle', defaultMessage: 'Your trial has started! Explore the benefits of Enterprise'})}
                </div> :
                <div className='title'>
                    {formatMessage({id: 'trial_benefits.modal.postTrialStarttitle', defaultMessage: 'You are on the Enterprise plan! Explore the benefits of Enterprise'})}
                </div>
            }

            {props.trialJustStarted ?
                <div className='description'>
                    {formatMessage(
                        {
                            id: 'trial_benefits.modal.trialStartDescription',
                            defaultMessage: 'Welcome to your Mattermost Enterprise trial! It expires on {trialExpirationDate}. Until then, enjoy the following benefits of Enterprise:',
                        },
                        {trialExpirationDate: trialEndDate},
                    )}
                </div> :
                <div className='description'>
                    {formatMessage(
                        {
                            id: 'trial_benefits.modal.postTrialStartDescription',
                            defaultMessage: 'Welcome to Enterprise! Your plan expires on {trialExpirationDate}. Until then, enjoy the following benefits of Enterprise:',
                        },
                        {trialExpirationDate: trialEndDate},
                    )}
                </div>
            }
            <div className='handSvg svg-wrapper'>
                <HandsSvg
                    width={400}
                    height={400}
                />
            </div>
            <div className='bottom-text-left-message'>
                {formatMessage({id: 'trial_benefits.modal.onlyVisibleToAdmins', defaultMessage: 'Only visible to admins'})}
            </div>
        </div>
    );
    steps.push(trialStartSlide);

    const ldapSlide = (
        <div className='slide-container'>
            <div className='title'>
                {formatMessage({id: 'trial_benefits.modal.ldapTitle', defaultMessage: 'Synchronize your Active Directory/LDAP groups'})}
            </div>
            <div className='description'>
                {formatMessage({id: 'trial_benefits.modal.ldapDescription', defaultMessage: 'Use AD/LDAP groups to organize and apply actions to multiple users at once. Manage team and channel memberships, permissions, and more.'})}
            </div>
            <a
                className='learnMoreButton'
                onClick={() => redirectToConsolePage(ConsolePages.LDAP)}
            >
                {learnMoreText}
            </a>
            <div className='ldapSvg svg-wrapper'>
                <LdapSvg
                    width={250}
                    height={200}
                />
            </div>
        </div>
    );
    steps.push(ldapSlide);

    const dataRetentionSlide = (
        <div className='slide-container'>
            <div className='title'>
                {formatMessage({id: 'trial_benefits.modal.dataRetentionTitle', defaultMessage: 'Create data retention schedules'})}
            </div>
            <div className='description'>
                {formatMessage({id: 'trial_benefits.modal.dataRetentionDescription', defaultMessage: 'Hold on to your data only as long as you need to. Create data retention jobs for select channels and teams to automatically delete disposable data.'})}
            </div>
            <a
                className='learnMoreButton'
                onClick={() => redirectToConsolePage(ConsolePages.DATA_RETENTION)}
            >{learnMoreText}</a>
            <div className='personBoxSvg svg-wrapper'>
                <PersonWithBoxSvg
                    width={250}
                    height={200}
                />
            </div>
        </div>
    );
    steps.push(dataRetentionSlide);

    const complianceExportSlide = (
        <div className='slide-container'>
            <div className='title'>
                {formatMessage({id: 'trial_benefits.modal.complianceExportTitle', defaultMessage: 'Run compliance exports'})}
            </div>
            <div className='description'>
                {formatMessage({id: 'trial_benefits.modal.complianceExportDescription', defaultMessage: 'Run daily compliance reports and export them to a variety of formats consumable by third-party integration tools such as Smarsh (Actiance).'})}
            </div>
            <a
                className='learnMoreButton'
                onClick={() => redirectToConsolePage(ConsolePages.COMPLIANCE_EXPORT)}
            >{learnMoreText}</a>
            <div className='personMacSvg svg-wrapper'>
                <PersonMacSvg
                    width={250}
                    height={200}
                />
            </div>
        </div>
    );
    steps.push(complianceExportSlide);

    const controlledAccessSlide = (
        <div className='slide-container'>
            <div className='title'>
                {formatMessage({id: 'trial_benefits.modal.controlledAccessTitle', defaultMessage: 'Control access via single sign-on (SSO)'})}
            </div>
            <div className='description'>
                {formatMessage({id: 'trial_benefits.modal.controlledAccessDescription', defaultMessage: 'Use SSO with SAML, AD/LDAP, Google, O365 or OpenID Connect to centralize identity management and automate account provisioning.'})}
            </div>
            <a
                className='learnMoreButton'
                onClick={() => redirectToConsolePage(ConsolePages.SAML)}
            >{learnMoreText}</a>
            <div className='personServerSvg svg-wrapper'>
                <PersonWithServersSvg
                    width={250}
                    height={200}
                />
            </div>
        </div>
    );
    steps.push(controlledAccessSlide);

    const customTermsSlide = (
        <div className='slide-container'>
            <div className='title'>
                {formatMessage({id: 'trial_benefits.modal.customTermsTitle', defaultMessage: 'Create custom terms of service'})}
            </div>
            <div className='description'>
                {formatMessage({id: 'trial_benefits.modal.customTermsDescription', defaultMessage: 'Create your own terms of service that new users must accept before accessing your Mattermost instance on desktop, web, or mobile.'})}
            </div>
            <a
                className='learnMoreButton'
                onClick={() => redirectToConsolePage(ConsolePages.CUSTOM_TERMS)}
            >{learnMoreText}</a>
            <div className='personSheetSvg svg-wrapper'>
                <PersonWithSheetSvg
                    width={250}
                    height={200}
                />
            </div>
        </div>
    );
    steps.push(customTermsSlide);

    return (
        <GenericModal
            className={'TrialBenefitsModal'}
            show={show}
            id='trialBenefitsModal'
            onExited={handleOnClose}
        >
            <Carousel
                dataSlides={steps}
                id={'trialBenefitsModalCarousel'}
                infiniteSlide={false}
            />
        </GenericModal>
    );
};

export default TrialBenefitsModal;
