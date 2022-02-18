// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import loadingIcon from 'images/spinner-48x48-blue.apng';

type Props = {
    checking: boolean;
    error: string | null;
    valid: boolean;
    userEdited: boolean;
}
export default function UrlStatus(props: Props) {
    const Status = (props: {children: React.ReactNode | React.ReactNodeArray; className?: string}) => {
        let className = 'Url__status';
        if (props.className) {
            className += ' ' + props.className;
        }
        return (
            <div className={className}>
                {props.children}
            </div>
        );
    };

    if (props.checking && props.userEdited) {
        return (
            <Status>
                <img
                    src={loadingIcon}
                    className='Url__status-spinner'
                />
                <FormattedMessage
                    id={'onboarding_wizard.url.input_testing'}
                    defaultMessage='Testing URL'
                />
            </Status>
        );
    }

    if (!props.checking && props.valid) {
        return (
            <Status className='Url__status--success'>
                <i className='icon icon-check'/>
                <FormattedMessage
                    id={'onboarding_wizard.url.input_valid'}
                    defaultMessage='Test successful. This is a valid URL.'
                />
            </Status>
        );
    }

    if (!props.checking && props.error) {
        return (
            <Status className='Url__status--error'>
                <i className='icon icon-alert-outline'/>
                <FormattedMessage
                    id={'onboarding_wizard.url.input_invalid'}
                    defaultMessage='Test unsuccessful. This is not a valid URL.'
                />
            </Status>
        );
    }

    return (
        <Status>
            <FormattedMessage
                id={'onboarding_wizard.url.input_help'}
                defaultMessage='Standard ports, such as 80 and 443, can be omitted, but non-standard ports are required'
            />
        </Status>
    );
}

