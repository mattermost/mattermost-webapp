// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage} from 'react-intl';

import moment from 'moment';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import {trackEvent} from 'actions/telemetry_actions';
import {daysToLicenseExpire} from 'utils/license_utils.jsx';
import {getBrowserTimezone} from 'utils/timezone';

import PurchaseLink from 'components/announcement_bar/purchase_link/purchase_link';

import './trial_license_card.scss';

export interface Props {
    license: any;
}

const TrialLicenseCard: React.FC<Props> = ({license}: Props) => {
    const currentDate = new Date();
    const endDate = new Date(parseInt(license?.ExpiresAt, 10));
    const daysToEndLicense = daysToLicenseExpire(license);

    const handleContactLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        trackEvent('admin', 'in_trial_contact_sales');
        window.open('https://mattermost.com/contact-us/', '_blank');
    };

    const message = () => {
        if (currentDate.toDateString() === endDate.toDateString()) {
            return (
                <FormattedMarkdownMessage
                    id='admin.license.trialCard.description.expiringToday'
                    defaultMessage='Your free trial expires **Today at {time}**. Visit our customer portal to purchase a license now to continue using E10 & E20 features after trial ends'
                    values={{
                        time: moment(endDate).endOf('day').format('h:mm a ') + moment().tz(getBrowserTimezone()).format('z'),
                    }}
                />
            );
        }

        return (
            <FormattedMarkdownMessage
                id='admin.license.trialCard.description'
                defaultMessage='Your free trial will expire in **{daysCount} {daysCount, plural, one {day} other {days}}**. Visit our customer portal to purchase a license now to continue using E10 & E20 features after trial ends.'
                values={{
                    daysCount: daysToEndLicense,
                }}
            />
        );
    };

    return (
        <div className='RenewLicenseCard TrialLicense'>
            <div className='RenewLicenseCard__text'>
                <div className='TrialLicenseCard__text-title'>
                    <FormattedMessage
                        id='admin.license.trialCard.licenseExpiring'
                        defaultMessage='You’re currently on a free trial of our E20 license.'
                    />
                </div>
                <div className='RenewLicenseCard__text-description'>
                    {message()}
                </div>
                <PurchaseLink
                    buttonTextElement={
                        <FormattedMessage
                            id='admin.license.trialCard.purchase_license'
                            defaultMessage='Purchase a license'
                        />
                    }
                />
                <button
                    className='ContactSales'
                    onClick={(e) => handleContactLinkClick(e)}
                >
                    <FormattedMessage
                        id='admin.license.trialCard.contactSales'
                        defaultMessage='Contact sales'
                    />
                </button>
            </div>
        </div>
    );
};

export default TrialLicenseCard;
