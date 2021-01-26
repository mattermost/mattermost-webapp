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
    let idTitleText = 'admin.license.renewalCard.licenseExpiring';
    let defaultTitleText = 'License expires in {days} days on {date, date, long}.';
    let iconClass = 'icon-alert-circle-outline';
    const today = moment(Date.now());
    const endOfLicense = moment(new Date(parseInt(license?.ExpiresAt, 10)));
    const daysToEndLicense = endOfLicense.diff(today, 'days');
    if (isLicenseExpired) {
        titleClass = 'RenewLicenseCard__text-title critical';
        idTitleText = 'admin.license.renewalCard.licenseExpired';
        defaultTitleText = 'License expired on {date, date, long}.';
        iconClass = 'icon-alert-outline';
    }
    return (
        <div className='RenewLicenseCard'>
            <div className='RenewLicenseCard__text'>
                <div className={titleClass}>
                    <i className={iconClass}/>
                    <FormattedMessage
                        id={idTitleText}
                        defaultMessage={defaultTitleText}
                        values={{
                            date: endOfLicense,
                            days: daysToEndLicense,
                        }}
                    />
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
                <RenewalLink/>
            </div>
        </div>
    );
};

export default RenewLicenseCard;
