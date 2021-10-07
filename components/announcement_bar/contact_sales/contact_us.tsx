// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';
import './contact_us.scss';

export interface Props {
    buttonTextElement?: JSX.Element;
    eventID?: string;
}

const ContactUsButton: React.FC<Props> = (props: Props) => {
    const handleContactUsLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        trackEvent(TelemetryCategories.ADMIN, props.eventID || 'in_trial_contact_sales');
        window.open('https://mattermost.com/contact-us/', '_blank');
    };

    return (
        <button
            className='contact-us'
            onClick={(e) => handleContactUsLinkClick(e)}
        >
            {props.buttonTextElement || (
                <FormattedMessage
                    id={'admin.license.trialCard.contactSales'}
                    defaultMessage={'Contact sales'}
                />
            )}
        </button>
    );
};

export default ContactUsButton;
