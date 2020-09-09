// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import './billing_subscriptions.scss';
import AlertBanner from 'components/alert_banner';

type Props = {

};

const BillingSubscriptions: React.FC<Props> = () => {
    const testTooltipLeft = (
        <Tooltip
            id='BillingSubscriptions__testTooltip'
            className='BillingSubscriptions__tooltip BillingSubscriptions__tooltip-left'
        >
            <div className='BillingSubscriptions__tooltipTitle'>
                {'Seat count overages'}
            </div>
            <div className='BillingSubscriptions__tooltipMessage'>
                {'Prolonged overages may result in additional charges. See how billing works'}
            </div>
        </Tooltip>
    );

    const testTooltipRight = (
        <Tooltip
            id='BillingSubscriptions__testTooltip'
            className='BillingSubscriptions__tooltip BillingSubscriptions__tooltip-right'
        >
            <div className='BillingSubscriptions__tooltipTitle'>
                {'What are partial charges?'}
            </div>
            <div className='BillingSubscriptions__tooltipMessage'>
                {'Users who have not been enabled for the full duration of the month are charged at a prorated monthly rate.'}
            </div>
        </Tooltip>
    );

    const [showDanger, setShowDanger] = useState(true);
    const [showWarning, setShowWarning] = useState(true);
    const [showInfo, setShowInfo] = useState(true);

    return (
        <div className='wrapper--fixed BillingSubscriptions'>
            <FormattedAdminHeader
                id='admin.billing.subscription.title'
                defaultMessage='Subscriptions'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {showDanger &&
                        <AlertBanner
                            mode='danger'
                            title='Test Danger Title'
                            message='This is a test danger message'
                            onDismiss={() => setShowDanger(false)}
                        />
                    }
                    {showWarning &&
                        <AlertBanner
                            mode='warning'
                            title='Test Warning Title'
                            message='This is a test warning message'
                            onDismiss={() => setShowWarning(false)}
                        />
                    }
                    {showInfo &&
                        <AlertBanner
                            mode='info'
                            title='Test Info Title'
                            message='This is a test info message'
                            onDismiss={() => setShowInfo(false)}
                        />
                    }
                    <div
                        className='BillingSubscriptions__topWrapper'
                        style={{marginTop: '20px'}}
                    >
                        <div style={{border: '1px solid #000', width: '568px', height: '438px'}}>
                            {'Plan Details Card'}
                            <OverlayTrigger
                                delayShow={500}
                                placement='bottom'
                                overlay={testTooltipLeft}
                            >
                                <button>{'Left Side Test Button'}</button>
                            </OverlayTrigger>
                            <OverlayTrigger
                                delayShow={500}
                                placement='bottom'
                                overlay={testTooltipRight}
                            >
                                <button>{'Right Side Test Button'}</button>
                            </OverlayTrigger>
                        </div>
                        <div style={{border: '1px solid #000', width: '332px', marginLeft: '20px'}}>
                            {'Billing Summary Card / Upgrade Mattermost Cloud'}
                        </div>
                    </div>
                    <div style={{border: '1px solid #000', width: '100%', height: '217px', marginTop: '20px'}}>
                        {'Private Cloud'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingSubscriptions;
