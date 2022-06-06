// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage, useIntl} from 'react-intl';

import moment from 'moment';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import {getBrowserTimezone} from 'utils/timezone';

import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import AlertBanner from 'components/alert_banner';
import UpgradeLink from 'components/widgets/links/upgrade_link';

import './trial_banner.scss';

export interface Props {
    trialEndDate: number;
}

const CloudTrialBanner = ({trialEndDate}: Props) => {
    const endDate = new Date(trialEndDate);
    const {formatMessage} = useIntl();
    const openSalesLink = useOpenSalesLink();

    return (
        <AlertBanner
            mode={'info'}
            title={(
                <FormattedMessage
                    id='admin.license.cloudTrialCard.upgradeTitle'
                    defaultMessage='Upgrade to one of our paid plans to avoid Starter plan data limits'
                />
            )}
            message={(
                <FormattedMarkdownMessage
                    id='admin.license.cloudTrialCard.description'
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
                    buttonText={formatMessage({id: 'admin.license.cloudTrialCard.upgrade', defaultMessage: 'Upgrade'})}
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
