// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage} from 'react-intl';

import moment from 'moment';

import RenewalLink from 'components/announcement_bar/renewal_link/';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import './renew_license_card.scss';
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
            defaultMessage='License expires in {days} days on {date, date, long}.'
            values={{
                date: endOfLicense,
                days: daysToEndLicense,
            }}
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
                    <i className={iconClass}/>
                    {cardTitle}
                </div>
                <div className='RenewLicenseCard__text-description bolder'>
                    <FormattedMessage
                        id='admin.license.renewalCard.description'
                        defaultMessage='Renew your Enterprise license through the Customer Portal to avoid any disruption.'
                    />
                </div>
                <div className='RenewLicenseCard__text-description'>
                    <FormattedMessage
                        id='admin.license.renewalCard.reviewNumbers'
                        defaultMessage='Review your numbers below to ensure you renew for the right number of users.'
                    />
                </div>
                <div className='RenewLicenseCard__licensedUsersNum'>
                    <FormattedMarkdownMessage
                        id='admin.license.renewalCard.licensedUsersNum'
                        defaultMessage='**Licensed Users:** {licensedUsersNum}'
                        values={{
                            licensedUsersNum: license.Users,
                        }}
                    />
                </div>
                <div className='RenewLicenseCard__activeUsersNum'>
                    <FormattedMarkdownMessage
                        id='admin.license.renewalCard.usersNumbers'
                        defaultMessage='**Active Users:** {activeUsersNum}'
                        values={{
                            activeUsersNum: totalUsers,
                        }}
                    />
                </div>
                <RenewalLink telemetryInfo={renewLinkTelemetry}/>
            </div>
        </div>
    );
};

export default RenewLicenseCard;
