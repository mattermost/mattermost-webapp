// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Dictionary} from 'mattermost-redux/types/utilities';
import {AnalyticsRow} from 'mattermost-redux/types/admin';

import * as Utils from 'utils/utils.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

import './feature_discovery.scss';

type Props = {
    featureName: string;

    titleID: string;
    titleDefault: string;

    copyID: string;
    copyDefault: string;

    learnMoreURL: string;

    imgPath: string;

    stats?: Dictionary<number | AnalyticsRow[]>;
    actions: {
        requestTrialLicense: (users: number, termsAccepted: boolean, receiveEmailsAccepted: boolean, featureName: string) => Promise<{error?: string; data?: null}>;
        getLicenseConfig: () => void;
    };
}

type State = {
    gettingTrial: boolean;
    gettingTrialError: string | null;
    termsAccepted: boolean;
    receiveEmailsAccepted: boolean;
}

export default class FeatureDiscovery extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            gettingTrial: false,
            gettingTrialError: null,
            termsAccepted: false,
            receiveEmailsAccepted: false,
        };
    }

    requestLicense = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (this.state.gettingTrial || !this.state.termsAccepted) {
            return;
        }
        this.setState({gettingTrial: true, gettingTrialError: null});
        let users = 0;
        if (this.props.stats && (typeof this.props.stats.TOTAL_USERS === 'number')) {
            users = this.props.stats.TOTAL_USERS;
        }
        const requestedUsers = Math.max(users, 30);
        const {error} = await this.props.actions.requestTrialLicense(requestedUsers, this.state.termsAccepted, this.state.receiveEmailsAccepted, this.props.featureName);
        if (error) {
            this.setState({gettingTrialError: error});
        } else {
            this.setState({termsAccepted: false, receiveEmailsAccepted: false});
        }
        this.setState({gettingTrial: false});
        this.props.actions.getLicenseConfig();
    }

    render() {
        const {
            titleID,
            titleDefault,
            copyID,
            copyDefault,
            learnMoreURL,
            imgPath
        } = this.props;

        let gettingTrialError: React.ReactNode = '';
        if (this.state.gettingTrialError) {
            gettingTrialError = (
                <p className='trial-error'>
                    <FormattedMarkdownMessage
                        id='admin.license.trial-request.error'
                        defaultMessage='Trial license could not be retrieved. Visit [https://mattermost.com/trial/](https://mattermost.com/trial/) to request a license.'
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
                    <button
                        className='btn btn-primary'
                        data-testid='featureDiscovery_primaryCallToAction'
                        disabled={!this.state.termsAccepted}
                        onClick={this.requestLicense}
                    >
                        <LoadingWrapper
                            loading={this.state.gettingTrial}
                            text={Utils.localizeMessage('admin.license.trial-request.loading', 'Getting trial')}
                        >
                            <FormattedMessage
                                id='admin.ldap_feature_discovery.call_to_action.primary'
                                defaultMessage='Start trial'
                            />
                        </LoadingWrapper>
                    </button>
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
                    <p className='trial-checkbox'>
                        <input
                            type='checkbox'
                            id='accept-terms'
                            checked={this.state.termsAccepted}
                            onChange={() => this.setState({termsAccepted: !this.state.termsAccepted})}
                        />
                        <label htmlFor='accept-terms'>
                            <FormattedMarkdownMessage
                                id='admin.license.trial-request.accept-terms'
                                defaultMessage='I have read and agree to the [Mattermost Software Evaluation Agreement](!https://mattermost.com/software-evaluation-agreement/) and [Privacy Policy](!https://mattermost.com/privacy-policy/).'
                            />
                        </label>
                    </p>
                    <p className='trial-checkbox'>
                        <input
                            type='checkbox'
                            id='accept-receive-emails'
                            checked={this.state.receiveEmailsAccepted}
                            onChange={() => this.setState({receiveEmailsAccepted: !this.state.receiveEmailsAccepted})}
                        />
                        <label htmlFor='accept-receive-emails'>
                            <FormattedMarkdownMessage
                                id='admin.license.trial-request.accept-receive-emails'
                                defaultMessage='By checking this box, I consent to receive emails from Mattermost with product updates, promotions, and company news. I have read the [Privacy Policy](!https://mattermost.com/privacy-policy/) and understand that I can unsubscribe at any time.'
                            />
                        </label>
                    </p>
                </div>

                <div className='FeatureDiscovery_imageWrapper'>
                    <img
                        className='FeatureDiscovery_image'
                        src={imgPath}
                        alt='Feature Discovery Image'
                    />
                </div>

            </div>
        );
    }
}
