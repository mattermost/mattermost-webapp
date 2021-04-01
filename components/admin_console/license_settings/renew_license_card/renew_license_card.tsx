// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage} from 'react-intl';

import moment from 'moment';

import RenewalLink from 'components/announcement_bar/renewal_link/';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import './renew_license_card.scss';
import PurchaseLink from "../../../announcement_bar/purchase_link/purchase_link";
import ContactSales from "../../../announcement_bar/contact_sales/contact_sales";
import {getBrowserTimezone} from "../../../../utils/timezone";
export interface RenewLicenseCardProps {
    license: any;
    isLicenseExpired: boolean;
    totalUsers: number;
}

const RenewLicenseCard: React.FC<RenewLicenseCardProps> = ({license, totalUsers, isLicenseExpired}: RenewLicenseCardProps) => {
    let titleClass = 'RenewLicenseCard__text-title';
    let iconClass = 'icon-alert-circle-outline';
    const today = moment(Date.now());
    const endOfLicense = moment(new Date(parseInt(license?.ExpiresAt, 10)));
    const daysToEndLicense = endOfLicense.diff(today, 'days');
    const hoursToEndLicense = endOfLicense.diff(today, 'hours');
    const renewLinkTelemetry = {success: 'renew_license_admin_console_success', error: 'renew_license_admin_console_fail'};
    let cardTitle = (
        <FormattedMessage
            id='admin.license.renewalCard.licenseExpiring'
            defaultMessage='You’re currently on a free trial of our E20 license.'
        />
    );
    if (isLicenseExpired) {
        titleClass = 'RenewLicenseCard__text-title critical';
        iconClass = 'icon-alert-outline';
        cardTitle = (
            <FormattedMessage
                id='admin.license.renewalCard.licenseExpired'
                defaultMessage='License expired on {date, date, long}.'
                values={{
                    date: endOfLicense,
                }}
            />
        );
    }

    let msg;

    if (hoursToEndLicense > 24) {
        msg = (<FormattedMessage
            id='admin.license.renewalCard.description'
            defaultMessage='Your free trial will expire in <b>{daysCount} {daysCount, plural, one {day} other {days}}</b>. Visit our customer portal to purchase a license now to continue using E10 & E20 features after trial ends.'
            values={{
                daysCount: daysToEndLicense,
                b: (chunk: any) => (<b>{chunk}</b>)
            }}
        />);
    } else {
        msg = (<FormattedMessage
            id='admin.license.renewalCard.description.expiringToday'
            defaultMessage='Your free trial expires <b>{day} at {time}</b>. Visit our customer portal to purchase a license now to continue using E10 & E20 features after trial ends'
            values={{
                day: endOfLicense.day() === today.day() ? 'Today' : 'Tomorrow',
                time: endOfLicense.format('h:mm a ') + moment().tz(getBrowserTimezone()).format('z'),
                b: (chunk: any) => (<b>{chunk}</b>)
            }}
        />);
    }

    return (
        <div className='RenewLicenseCard'>
            <div className='RenewLicenseCard__text'>
                <div className={titleClass}>
                    {cardTitle}
                </div>
                <div className='RenewLicenseCard__text-description'>
                    {msg}
                </div>
                <div className='buttonGroup'>
                    <PurchaseLink/>
                    <ContactSales/>
                </div>
            </div>
        </div>
    );
};

export default RenewLicenseCard;
