// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage, useIntl} from 'react-intl';

import moment from 'moment';

import {getBrowserTimezone} from 'utils/timezone';

import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import AlertBanner from 'components/alert_banner';
import UpgradeLink from 'components/widgets/links/upgrade_link';

import './cloud_trial_banner.scss';

export interface Props {
    trialEndDate: number;
}

const CloudTrialBanner = ({trialEndDate}: Props): JSX.Element | null => {
    const endDate = new Date(trialEndDate);
    const {formatMessage} = useIntl();
    const openSalesLink = useOpenSalesLink();

    if (trialEndDate === 0) {
        return null;
    }

    return (
        <AlertBanner
            mode={'info'}
            title={(
                <FormattedMessage
                    id='admin.subscription.cloudTrialCard.upgradeTitle'
                    defaultMessage='Upgrade to one of our paid plans to avoid Starter plan data limits'
                />
            )}
            message={(
                <FormattedMessage
                    id='admin.subscription.cloudTrialCard.description'
                    defaultMessage='Your trial ends on {date} {time}. Upgrade to one of our paid plans with no limits.'
                    values={{
                        date: moment(endDate).format('MMM D, YYYY '),
                        time: moment(endDate).endOf('day').format('h:mm a ') + moment().tz(getBrowserTimezone()).format('z'),
                    }}
                />
            )}
            hideIcon={true}
            actionButtonLeft={(
                <UpgradeLink
                    buttonText={formatMessage({id: 'admin.subscription.cloudTrialCard.upgrade', defaultMessage: 'Upgrade'})}
                    styleButton={true}
                />
            )}
            actionButtonRight={(
                <button
                    onClick={openSalesLink}
                    className='AlertBanner__buttonRight'
                >
                    <FormattedMessage
                        id='admin.billing.subscription.privateCloudCard.contactSalesy'
                        defaultMessage={
                            'Contact sales'
                        }
                    />
                </button>
            )}
        />
    );
};

export default CloudTrialBanner;
