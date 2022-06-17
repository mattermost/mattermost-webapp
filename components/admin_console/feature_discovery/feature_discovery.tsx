// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {AnalyticsRow} from '@mattermost/types/admin';
import {ClientLicense} from '@mattermost/types/config';
import {Subscription} from '@mattermost/types/cloud';
import {EmbargoedEntityTrialError} from 'components/admin_console/license_settings/trial_banner/trial_banner';
import AlertBanner from 'components/alert_banner';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import {ActionResult} from 'mattermost-redux/types/actions';
import * as Utils from 'utils/utils';

import {trackEvent} from 'actions/telemetry_actions';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import PurchaseModal from 'components/purchase_modal';
import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';

import {ModalData} from 'types/actions';

import './feature_discovery.scss';

type Props = {
    featureName: string;

    titleID: string;
    titleDefault: string;

    copyID: string;
    copyDefault: string;

    learnMoreURL: string;

    featureDiscoveryImage: JSX.Element;

    prevTrialLicense: ClientLicense;

    stats?: Record<string, number | AnalyticsRow[]>;
    actions: {
        requestTrialLicense: (users: number, termsAccepted: boolean, receiveEmailsAccepted: boolean, featureName: string) => Promise<ActionResult>;
        getLicenseConfig: () => void;
        getPrevTrialLicense: () => void;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
    isCloud: boolean;
    isCloudTrial: boolean;
    hadPrevCloudTrial: boolean;
    subscription: Subscription | undefined;
    isPaidSubscription: boolean;
}

type State = {
    gettingTrial: boolean;
    gettingTrialError: string | null;
    gettingTrialResponseCode: number | null;
}

export default class FeatureDiscovery extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            gettingTrial: false,
            gettingTrialError: null,
            gettingTrialResponseCode: null,
        };
    }

    componentDidMount() {
        this.props.actions.getPrevTrialLicense();
    }

    requestLicense = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (this.state.gettingTrial) {
            return;
        }
        this.setState({gettingTrial: true, gettingTrialError: null});
        let users = 0;
        if (this.props.stats && (typeof this.props.stats.TOTAL_USERS === 'number')) {
            users = this.props.stats.TOTAL_USERS;
        }
        const requestedUsers = Math.max(users, 30);
        const {error, data} = await this.props.actions.requestTrialLicense(requestedUsers, true, true, this.props.featureName);
        if (error) {
            if (typeof data?.status === 'undefined') {
                this.setState({gettingTrialError: error});
            } else {
                this.setState({gettingTrialError: error, gettingTrialResponseCode: data.status});
            }
        }
        this.setState({gettingTrial: false});
        this.props.actions.getLicenseConfig();
    }

    openUpgradeModal = (e: React.MouseEvent) => {
        e.preventDefault();

        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_ADMIN,
            'click_subscribe_from_feature_discovery',
        );

        this.props.actions.openModal({
            modalId: ModalIdentifiers.CLOUD_PURCHASE,
            dialogType: PurchaseModal,
        });
    }

    renderStartTrial = (learnMoreURL: string, gettingTrialError: React.ReactNode) => {
        const {
            isCloud,
            isCloudTrial,
            hadPrevCloudTrial,
            isPaidSubscription,
        } = this.props;
        const canRequestCloudFreeTrial = isCloud && !isCloudTrial && !hadPrevCloudTrial && !isPaidSubscription;

        // by default we assume is not cloud, so the cta button is Start Trial (which will request a trial license)
        let primaryMessage = (
            <FormattedMessage
                id='admin.ldap_feature_discovery.call_to_action.primary'
                defaultMessage='Start trial'
            />
        );
        let ctaButtonFunction: (e: React.MouseEvent) => void = this.requestLicense;

        // then if it is cloud, and this account already had a free trial, then the cta button must be Upgrade now
        if (isCloud && hadPrevCloudTrial) {
            ctaButtonFunction = this.openUpgradeModal;
            primaryMessage = (
                <FormattedMessage
                    id='admin.ldap_feature_discovery_cloud.call_to_action.primary'
                    defaultMessage='Upgrade now'
                />
            );
        }

        // if all conditions are set for being able to request a cloud trial, then show the cta start cloud trial button
        // otherwise use the previously defined conditions to elaborate the button
        const ctaPrimaryButton = canRequestCloudFreeTrial ? (
            <CloudStartTrialButton
                message={Utils.localizeMessage('admin.ldap_feature_discovery.call_to_action.primary', 'Start trial')}
                telemetryId={'start_cloud_trial_feature_discovery'}
                extraClass='btn btn-primary'
            />
        ) : (
            <button
                type='button'
                className='btn btn-primary'
                data-testid='featureDiscovery_primaryCallToAction'
                onClick={ctaButtonFunction}
            >
                <LoadingWrapper
                    loading={this.state.gettingTrial}
                    text={Utils.localizeMessage('admin.license.trial-request.loading', 'Getting trial')}
                >
                    {primaryMessage}
                </LoadingWrapper>
            </button>
        );
        return (
            <>
                {ctaPrimaryButton}
                <a
                    className='btn btn-secondary'
                    href={learnMoreURL}
                    data-testid='featureDiscovery_secondaryCallToAction'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <FormattedMessage
                        id='admin.ldap_feature_discovery.call_to_action.secondary'
                        defaultMessage='Learn more'
                    />
                </a>
                {gettingTrialError}
                {(!this.props.isCloud || canRequestCloudFreeTrial) && <p className='trial-legal-terms'>
                    <FormattedMarkdownMessage
                        id='admin.license.trial-request.accept-terms'
                        defaultMessage='By clicking **Start trial**, I agree to the [Mattermost Software Evaluation Agreement](!https://mattermost.com/software-evaluation-agreement/), [Privacy Policy](!https://mattermost.com/privacy-policy/), and receiving product emails.'
                    />
                </p>}
            </>
        );
    }

    render() {
        const {
            titleID,
            titleDefault,
            copyID,
            copyDefault,
            learnMoreURL,
            featureDiscoveryImage,
            isCloud,
            isCloudTrial,
            subscription,
        } = this.props;

        // on first load the license information is available and we can know if it is cloud license, but the subscription is not loaded yet
        // so on initial load we check if it is cloud license and in the case the subscription is still undefined we show the loading spinner to avoid
        // component change flashing
        if (isCloud && !subscription) {
            return (<LoadingSpinner/>);
        }

        let gettingTrialError: React.ReactNode = '';
        if (this.state.gettingTrialError && this.state.gettingTrialResponseCode === 451) {
            gettingTrialError = (
                <p className='trial-error'>
                    <EmbargoedEntityTrialError/>
                </p>
            );
        } else if (this.state.gettingTrialError) {
            gettingTrialError = (
                <p className='trial-error'>
                    <FormattedMarkdownMessage
                        id='admin.license.trial-request.error'
                        defaultMessage='Trial license could not be retrieved. Visit [https://mattermost.com/trial/](https://mattermost.com/trial/) to request a license.'
                    />
                </p>
            );
        }

        // if it is cloud and is in trial, in the case this component get's shown that means that the license hasn't been updated yet
        // so let's notify to the user that the license
        if (isCloud && isCloudTrial && subscription !== undefined) {
            return (
                <div className='FeatureDiscovery'>
                    <AlertBanner
                        mode='info'
                        title={
                            <FormattedMessage
                                id='admin.featureDiscovery.WarningTitle'
                                defaultMessage='Your trial has started and updates are being made to your license.'
                            />
                        }
                        message={
                            <>
                                <FormattedMarkdownMessage
                                    id='admin.featureDiscovery.WarningDescription'
                                    defaultMessage='Your License is being updated to give you full access to all the Enterprise Features. This page will automatically refresh once the license update is complete. Please wait '
                                />
                                <LoadingSpinner/>
                            </>
                        }
                    />
                </div>
            );
        }

        return (
            <div className='FeatureDiscovery'>
                <div className='FeatureDiscovery_copyWrapper'>
                    <div
                        className='FeatureDiscovery_title'
                        data-testid='featureDiscovery_title'
                    >
                        <FormattedMessage
                            id={titleID}
                            defaultMessage={titleDefault}
                        />
                    </div>
                    <div className='FeatureDiscovery_copy'>
                        <FormattedMessage
                            id={copyID}
                            defaultMessage={copyDefault}
                        />
                    </div>
                    {this.props.prevTrialLicense?.IsLicensed === 'true' ? Utils.renderPurchaseLicense() : this.renderStartTrial(learnMoreURL, gettingTrialError)}
                </div>
                <div className='FeatureDiscovery_imageWrapper'>
                    {featureDiscoveryImage}
                </div>
            </div>
        );
    }
}
