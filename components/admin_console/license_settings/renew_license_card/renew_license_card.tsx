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
    return (
        <div className='RenewLicenseCard'>
            <div className='RenewLicenseCard__text'>
                <div className={titleClass}>
                    {cardTitle}
                </div>
                <div className='RenewLicenseCard__text-description'>
                    <FormattedMessage
                        id='admin.license.renewalCard.description'
                        defaultMessage='"Your free trial will expire in {daysCount} {dayDays}. Visit our customer portal to purchase a license now to continue using E10 & E20 features after trial ends."'
                        values={{
                            daysCount: daysToEndLicense,
                            b: (chunk: any) => (<b>{chunk}</b>)
                        }}
                    />
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
