// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {BadUrlReasons, UrlValidationCheck} from 'utils/url';
import Constants from 'utils/constants';

const OrganizationStatus = (props: {error: UrlValidationCheck['error']}): JSX.Element => {
    let message = null;
    let className = 'Organization__status';
    if (props.error) {
        className += ' Organization__status--error';
        switch (props.error) {
        case BadUrlReasons.Empty:
            message = (
                <FormattedMessage
                    id='onboarding_wizard.organization.empty'
                    defaultMessage='You must enter an organization name'
                />
            );
            break;
        case BadUrlReasons.Length:
            message = (
                <FormattedMessage
                    id='onboarding_wizard.organization.length'
                    defaultMessage='Organization name must be between {min} and {max} characters'
                    values={{
                        min: Constants.MIN_TEAMNAME_LENGTH,
                        max: Constants.MAX_TEAMNAME_LENGTH,
                    }}
                />
            );
            break;
        case BadUrlReasons.Reserved:
            message = (
                <FormattedMessage

                    id='onboarding_wizard.organization.reserved'
                    defaultMessage='Organization name may not <a>start with a reserved word</a>.'
                    values={{
                        a: (chunks: React.ReactNode | React.ReactNodeArray) => (
                            <a
                                href='https://docs.mattermost.com/messaging/creating-teams.html#team-url'
                                target='_blank'
                                rel='noreferrer'
                            >
                                {chunks}
                            </a>
                        ),
                    }}
                />
            );
            break;
        default:
            message = (
                <FormattedMessage
                    id='onboarding_wizard.organization.other'
                    defaultMessage='Invalid organization name: {reason}'
                    values={{
                        reason: props.error,
                    }}
                />
            );
            break;
        }
    }
    return (<div className={className}>
        {props.error && <i className='icon icon-alert-outline'/>}
        {message}
    </div>);
};

export default OrganizationStatus;
