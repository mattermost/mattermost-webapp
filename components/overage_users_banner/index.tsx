// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'types/store';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';
import {calculateOverageUserActivated} from 'utils/overage_team';
import {isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {PreferenceType} from '@mattermost/types/preferences';
import {LicenseLinks, StatTypes, Preferences, AnnouncementBarTypes} from 'utils/constants';

import './overage_users_banner.scss';

type AdminHasWatchItArgs = {
    preferenceName: string;
    overagePreferences: PreferenceType[];
    isWarningBanner: boolean;
}

const adminHasWatchIt = ({preferenceName, overagePreferences, isWarningBanner}: AdminHasWatchItArgs): boolean => {
    if (isWarningBanner) {
        return overagePreferences.find((value) => value.name === preferenceName) !== undefined;
    }

    return false;
};

const OverageUsersBanner = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const stats = useSelector((state: GlobalState) => state.entities.admin.analytics) || {};
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const user = useSelector(getCurrentUser);
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

    if (!isAdmin || !isOverageState || isCloud || adminHasWatchIt({isWarningBanner: isBetween5PercerntAnd10PercentPurchasedSeats, overagePreferences, preferenceName})) {
        return null;
    }

    const handleClose = () => {
        dispatch(savePreferences(currentUser.id, [{
            category: Preferences.OVERAGE_USERS_BANNER,
            name: preferenceName,
            user_id: currentUser.id,
            value: 'Overage users banner watched',
        }]));
    };

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        window.open(LicenseLinks.CONTACT_SALES, '_blank');
    };

    const message = (
        <FormattedMessage
            id='licensingPage.overageUsersBanner.text'
            defaultMessage='Your workspace user count has exceeded your paid license seat count by {seats, number} {seats, plural, one {seat} other {seats}}. Purchase additional seats to remain compliant.'
            values={{
                seats: overageByUsers,
            }}
        />);

    const cta = formatMessage({
        id: 'licensingPage.overageUsersBanner.cta',
        defaultMessage: 'Contact Sales',
    });

    return (
        <AnnouncementBar
            type={isBetween5PercerntAnd10PercentPurchasedSeats ? AnnouncementBarTypes.GENERAL : AnnouncementBarTypes.CRITICAL}
            showCloseButton={isBetween5PercerntAnd10PercentPurchasedSeats}
            onButtonClick={handleClick}
            modalButtonText={cta}
            modalButtonDefaultText={cta}
            message={message}
            showLinkAsButton={true}
            isTallBanner={true}
            icon={<i className='icon icon-alert-outline'/>}
            handleClose={handleClose}
            showCTA={license.Email === user.email}
        />
    );
};

export default OverageUsersBanner;
