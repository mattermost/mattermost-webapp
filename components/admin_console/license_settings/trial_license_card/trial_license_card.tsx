// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage} from 'react-intl';

import moment from 'moment';

import {trackEvent} from 'actions/telemetry_actions';
import {getBrowserTimezone} from 'utils/timezone';

import PurchaseNowLink from 'components/announcement_bar/purchase_now_link/purchase_now_link';

import './trial_license_card.scss';

export interface Props {
    license: any;
}

const TrialLicenseCard: React.FC<Props> = ({license}: Props) => {
    const today = moment(Date.now());
    const endOfLicense = moment(new Date(parseInt(license?.ExpiresAt, 10)));
    const daysToEndLicense = endOfLicense.diff(today, 'days');
    const hoursToEndLicense = endOfLicense.diff(today, 'hours');

    const handleContactLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        trackEvent('admin', 'in_trial_contact_sales');
        window.open('https://mattermost.com/contact-us/', '_blank');
    };

    const message = () => {
        if (hoursToEndLicense > 24) {
            return (
                <FormattedMessage
                    id='admin.license.trialCard.description'
                    defaultMessage='Your free trial will expire in <b>{daysCount} {daysCount, plural, one {day} other {days}}</b>. Visit our customer portal to purchase a license now to continue using E10 & E20 features after trial ends.'
                    values={{
                        daysCount: daysToEndLicense,
                        b: (chunk: any) => (<b>{chunk}</b>),
                    }}
                />
            );
        }

        return (
            <FormattedMessage
                id='admin.license.trialCard.description.expiringToday'
                defaultMessage='Your free trial expires <b>{day} at {time}</b>. Visit our customer portal to purchase a license now to continue using E10 & E20 features after trial ends'
                values={{
                    day: endOfLicense.day() === today.day() ? 'Today' : 'Tomorrow',
                    time: endOfLicense.format('h:mm a') + moment().tz(getBrowserTimezone()).format('z'),
                    b: (chunk: any) => (<b>{chunk}</b>),
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
                <PurchaseNowLink 
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
                        id='admin.billing.subscription.privateCloudCard.contactSales'
                        defaultMessage='Contact sales'
                    />
                </button>
            </div>
        </div>
    );
};

export default TrialLicenseCard;
