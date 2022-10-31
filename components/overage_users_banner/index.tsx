// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'types/store';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import AlertBanner from 'components/alert_banner';
import {calculateOverageUserActivated} from 'utils/overage_team';
import {isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {PreferenceType} from '@mattermost/types/preferences';
import {LicenseLinks, StatTypes, Preferences} from 'utils/constants';

import './overage_users_banner.scss';

type OverageUsersBannerProps = {
    location: 'admin-console' | 'app';
}

type AdminHasWatchItArgs = {
    isAppView: boolean;
    preferenceName: string;
    overagePreferences: PreferenceType[];
    isWarningBanner: boolean;
}

const adminHasWatchIt = ({isAppView, preferenceName, overagePreferences, isWarningBanner}: AdminHasWatchItArgs): boolean => {
    if (isAppView) {
        return overagePreferences.find((value) => value.name === preferenceName) !== undefined;
    }

    if (isWarningBanner) {
        return overagePreferences.find((value) => value.name === preferenceName) !== undefined;
    }

    return false;
};

const OverageUsersBanner = ({location}: OverageUsersBannerProps) => {
    const isAppView = location === 'app';
    const dispatch = useDispatch();
    const stats = useSelector((state: GlobalState) => state.entities.admin.analytics) || {};
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const license = useSelector(getLicense);
    const seatsPurchased = parseInt(license.Users, 10);
    const isCloud = useSelector(isCurrentLicenseCloud);
    const getPreferencesCategory = makeGetCategory();
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const overagePreferences = useSelector((state: GlobalState) => getPreferencesCategory(state, Preferences.OVERAGE_USERS_BANNER));
    const activeUsers = ((stats || {})[StatTypes.TOTAL_USERS]) as number || 0;
    const {
        isBetween5PercerntAnd10PercentPurchasedSeats,
        isOver10PercerntPurchasedSeats,
    } = calculateOverageUserActivated({
        activeUsers,
        seatsPurchased,
    });
    const prefixPreferences = isOver10PercerntPurchasedSeats ? 'error' : 'warn';
    const preferenceName = `${prefixPreferences}_overage_seats_${seatsPurchased}`;

    const overageByUsers = activeUsers - seatsPurchased;

    const isOverageState = isBetween5PercerntAnd10PercentPurchasedSeats || isOver10PercerntPurchasedSeats;

    if (!isAdmin || !isOverageState || isCloud || adminHasWatchIt({isAppView, isWarningBanner: isBetween5PercerntAnd10PercentPurchasedSeats, overagePreferences, preferenceName})) {
        return null;
    }

    const handleDismiss = () => {
        if (isAppView || isBetween5PercerntAnd10PercentPurchasedSeats) {
            dispatch(savePreferences(currentUser.id, [{
                category: Preferences.OVERAGE_USERS_BANNER,
                name: preferenceName,
                user_id: currentUser.id,
                value: 'Overage users banner watched',
            }]));
        }
    };

    const isDimissable = isAppView || isBetween5PercerntAnd10PercentPurchasedSeats;

    return (
        <AlertBanner
            mode={isOver10PercerntPurchasedSeats ? 'danger' : 'warning'}
            onDismiss={isDimissable ? handleDismiss : undefined}
            title={
                <FormattedMessage
                    id='licensingPage.overageUsersBanner.title'
                    defaultMessage='Your workspace user count has exceeded your paid license seat count by {seats, number} {seats, plural, one {seat} other {seats}}'
                    values={{
                        seats: overageByUsers,
                    }}
                />
            }
            message={
                <FormattedMessage
                    id='licensingPage.overageUsersBanner.description'
                    defaultMessage='Notify your Customer Success Manager on your next true-up check. <a>Contact Sales</a>'
                    values={{
                        a: (chunks: React.ReactNode) => {
                            return (
                                <a
                                    className='overage_users_banner__button'
                                    href={LicenseLinks.CONTACT_SALES}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    {chunks}
                                </a>
                            );
                        },
                    }}
                >
                    {(text) => <p className='overage_users_banner__description'>{text}</p>}
                </FormattedMessage>
            }
        />
    );
};

export default OverageUsersBanner;
