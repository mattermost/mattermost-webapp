// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage} from 'react-intl';

import moment from 'moment';

import RenewalLink from 'components/announcement_bar/renewal_link/';

import alertIcon from 'images/icons/round-blue-info-icon.svg';
import warningIcon from 'images/icons/warning-red-icon.svg';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import './renew_license_link_card.scss';

export interface RenewLicenseLinkCardProps {
    license: any;
    isLicenseExpired: boolean;
    totalUsers: number;
}

const RenewLicenseLinkCard: React.FC<RenewLicenseLinkCardProps> = ({license, totalUsers, isLicenseExpired}: RenewLicenseLinkCardProps) => {
    let titleClass = 'RenewLicenseLinkCard__text-title';
    let icon = alertIcon;
    let idTitleText = 'admin.license.license_expiring';
    let defaultTitleText = 'License expires in {days} days on {date, date, long}.';
    const today = moment(Date.now());
    const endOfLicense = moment(new Date(parseInt(license?.ExpiresAt, 10)));
    const daysToEndLicense = endOfLicense.diff(today, 'days');
    if (isLicenseExpired) {
        titleClass = 'RenewLicenseLinkCard__text-title critical';
        icon = warningIcon;
        idTitleText = 'admin.license.license_expired';
        defaultTitleText = 'License expired on {date, date, long}.';
    }
    return (
        <div className='RenewLicenseLinkCard'>
            <div className='RenewLicenseLinkCard__text'>
                <div className={titleClass}>
                    <img
                        className='advisor-icon'
                        src={icon}
                    />
                    <FormattedMessage
                        id={idTitleText}
                        defaultMessage={defaultTitleText}
                        values={{
                            date: endOfLicense,
                            days: daysToEndLicense,
                        }}
                    />
                </div>
                <div className='RenewLicenseLinkCard__text-description bolder'>
                    <FormattedMessage
                        id='admin.license.subscription.privateCloudCard.description'
                        defaultMessage='Renew your Enterprise license through the Customer Portal to avoid any disruption.'
                    />
                </div>
                <div className='RenewLicenseLinkCard__text-description'>
                    <FormattedMessage
                        id='admin.license.subscription.privateCloudCard.description'
                        defaultMessage='Review your numbers below to ensure you renew for theright number of users.'
                    />
                </div>
                <div className='RenewLicenseLinkCard__licensedUsersNum'>
                    <FormattedMarkdownMessage
                        id='admin.license.subscription.privateCloudCard.licensedUsersNum'
                        defaultMessage='**Licensed Users:** {licensedUsersNum}'
                        values={{
                            licensedUsersNum: license.Users,
                        }}
                    />
                </div>
                <div className='RenewLicenseLinkCard__activeUsersNum'>
                    <FormattedMarkdownMessage
                        id='admin.license.subscription.privateCloudCard.usersNumbers'
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

export default RenewLicenseLinkCard;
