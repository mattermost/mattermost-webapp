// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

import {FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';

import {trackEvent} from 'actions/telemetry_actions';
import {
    ModalIdentifiers,
} from 'utils/constants';

import NoInternetConnection from '../no_internet_connection/no_internet_connection';

const ContactSales = () => {
    const handleLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        window.open('https://mattermost.com/contact-us/', '_blank');
        // TODO finalize the metric
        trackEvent('in_trial_contact_sales', 'clicked');
    };

    return (
        <>
            <button
                className='annnouncementBar__contactSales'
                onClick={(e) => handleLinkClick(e)}
            >
                <FormattedMessage
                    id='admin.billing.subscription.privateCloudCard.contactSales'
                    defaultMessage='Contact sales'
                />
            </button>
        </>
    );
};

export default ContactSales;
