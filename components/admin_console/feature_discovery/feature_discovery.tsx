// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import {AnalyticsRow} from '@mattermost/types/admin';
import {ClientLicense} from '@mattermost/types/config';
import {EmbargoedEntityTrialError} from 'components/admin_console/license_settings/trial_banner/trial_banner';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import {ActionResult} from 'mattermost-redux/types/actions';
import * as Utils from 'utils/utils';

import {trackEvent} from 'actions/telemetry_actions';

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
    isCloudFreeEnabled: boolean;
    hadPrevCloudTrial: boolean;
    isCloudFreePaidSubscription: boolean;
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
        let primaryMessage = (
            <FormattedMessage
                id='admin.ldap_feature_discovery.call_to_action.primary'
                defaultMessage='Start trial'
            />
        );
        if (this.props.isCloud && !this.props.isCloudFreeEnabled) {
            primaryMessage = (
                <FormattedMessage
                    id='admin.ldap_feature_discovery_cloud.call_to_action.primary'
                    defaultMessage='Subscribe now'
                />
            );
        }
        const {
            isCloud,
            isCloudTrial,
            isCloudFreeEnabled,
            hadPrevCloudTrial,
            isCloudFreePaidSubscription,
        } = this.props;
        const canRequestCloudFreeTrial = isCloud && isCloudFreeEnabled && !isCloudTrial && !hadPrevCloudTrial && !isCloudFreePaidSubscription;

        const ctaTrialButton = canRequestCloudFreeTrial ? (
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
                onClick={this.props.isCloud ? this.openUpgradeModal : this.requestLicense}
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
            <React.Fragment>
                {ctaTrialButton}
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
                        defaultMessage='By clicking **Start trial**, I agree to the <linkEvaluation>Mattermost Software Evaluation Agreement</linkEvaluation>, <linkPrivacy>Privacy Policy</linkPrivacy>, and receiving product emails.'
                        values={{
                            linkEvaluation: (msg: React.ReactNode) => (
                                <a
                                    href='https://mattermost.com/software-evaluation-agreement'
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    {msg}
                                </a>
                            ),
                            linkPrivacy: (msg: React.ReactNode) => (
                                <a
                                    href='https://mattermost.com/privacy-policy/'
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    {msg}
                                </a>
                            ),
                        }}
                    />
                </p>}
            </React.Fragment>
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
        } = this.props;

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
                    <FormattedMessage
                        id='admin.license.trial-request.error'
                        defaultMessage='Trial license could not be retrieved. Visit <link>https://mattermost.com/trial</link> to request a license.'
                        values={{
                            link: (msg: React.ReactNode) => (
                                <a
                                    href='https://mattermost.com/trial/'
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    {msg}
                                </a>
                            ),
                        }}
                    />
                </p>
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
