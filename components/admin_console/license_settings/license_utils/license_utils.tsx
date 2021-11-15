// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AlertBanner from 'components/alert_banner';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import {localizeMessage} from 'utils/utils';

export const free30DayTrial = (
    isDisabled: boolean,
    gettingTrialError: JSX.Element | null,
    requestLicense: (e: any) => Promise<void>,
    gettingTrial: boolean,
): JSX.Element => {
    return (
        <AlertBanner
            mode='info'
            title={
                <FormattedMessage
                    id='licensingPage.infoBanner.startTrialTitle'
                    defaultMessage='Free 30 day trial!'
                />
            }
            message={
                <div className='banner-start-trial'>
                    <p className='license-trial-legal-terms'>
                        <FormattedMessage
                            id='admin.license.trial-request.title'
                            defaultMessage='Experience Mattermost Enterprise Edition for free for the next 30 days. No obligation to buy or credit card required. '
                        />
                        <FormattedMarkdownMessage
                            id='admin.license.trial-request.accept-terms'
                            defaultMessage='By clicking **Start trial**, I agree to the [Mattermost Software Evaluation Agreement](!https://mattermost.com/software-evaluation-agreement/), [Privacy Policy](!https://mattermost.com/privacy-policy/), and receiving product emails.'
                        />
                    </p>
                    <div className='trial'>
                        <button
                            type='button'
                            className='btn btn-primary'
                            onClick={requestLicense}
                            disabled={isDisabled}
                        >
                            <LoadingWrapper
                                loading={gettingTrial}
                                text={localizeMessage('admin.license.trial-request.loading', 'Getting trial')}
                            >
                                <FormattedMessage
                                    id='admin.license.trial-request.submit'
                                    defaultMessage='Start trial'
                                />
                            </LoadingWrapper>
                        </button>
                    </div>
                    {gettingTrialError}
                </div>
            }
        />
    );
};
