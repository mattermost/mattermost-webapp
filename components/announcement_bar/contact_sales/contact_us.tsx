// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';
import './contact_us.scss';

import {t} from 'utils/i18n';

export interface Props {
    titleID?: string;
    eventID?: string;
}

const ContactUs: React.FC<Props> = (props: Props) => {
    const handleContactSalesLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        trackEvent('admin', props.eventID || 'in_trial_contact_sales');
        window.open('https://mattermost.com/contact-us/', '_blank');
    };

    return (
        <button
            className='contact-sales'
            onClick={(e) => handleContactSalesLinkClick(e)}
        >
            <FormattedMessage
                id={props.titleID || t('admin.license.trialCard.contactSales')}
                defaultMessage={'Contact sales'}
            />
        </button>
    );
};

export default ContactUs;
