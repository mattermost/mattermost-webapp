// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';

import {useDispatch, useSelector} from 'react-redux';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import {getTrueUpReviewBundle} from 'mattermost-redux/actions/cloud';
import {getTrueUpReviewProfile as trueUpReviewProfileSelector} from 'mattermost-redux/selectors/entities/cloud';

const SendReviewButton = styled.button`
background: var(--denim-button-bg);
border-radius: 4px;
border: none;
box-shadow: none;
height: 50px;
width: 250px;
font-family: 'Open Sans';
font-style: normal;
font-weight: 600;
line-height: 10px;
letter-spacing: 0.02em;
color: var(--button-color);
`;

const TrueUpReview: React.FC = () => {
    const dispatch = useDispatch();
    const [isAirGapped] = useState(true);
    const reviewProfile = useSelector(trueUpReviewProfileSelector);

    const handleSubmitReview = () => {
		dispatch(getTrueUpReviewBundle());
    };

    const handleDownloadBundle = async () => {
        await dispatch(getTrueUpReviewBundle());

        // Create the bundle as a blob and assign it to a link element.
        const blob = new Blob([JSON.stringify(reviewProfile)], {type: 'application/json'});
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'true-up-review-bundle.json';

        document.body.appendChild(link);
        link.click();

        // Remove link and revoke object url to avoid memory leaks.
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };

    const cta = (isAirGapped ?
        (<FormattedMessage
            id='admin.billing.trueUpReview.send.data'
            defaultMessage='Download Data'
        />)		:
        (<FormattedMessage
            id='admin.billing.trueUpReview.send.data'
            defaultMessage='Send Data'
        />)
    );

    const description = (
        isAirGapped ?
            (<FormattedMessage
                id='admin.billing.trueUpReview.download.bundle'
                defaultMessage='Download true-up review bundle'
            />)			:
            (<FormattedMessage
                id='admin.billing.trueUpReview.send.data'
                defaultMessage='Send data for true-up review'
            />)
    );

    const submitButton = (
        <SendReviewButton onClick={isAirGapped ? handleDownloadBundle : handleSubmitReview}>
            {isAirGapped ?
                <FormattedMessage
                    id='admin.billing.trueUpReview.button.download'
                    defaultMessage='Download True Up Review Bundle'
                />				:
                <FormattedMessage
                    id='admin.billing.trueUpReview.button.submit'
                    defaultMessage='Submit True Up Review'
                />
            }
        </SendReviewButton>
    );

    return (
        <div className='wrapper--fixed TrueUpReview'>
            <FormattedAdminHeader
                id='admin.billing.trueUpReview.title'
                defaultMessage='True Up Review'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <div className='TrueUpReview__card'>
                        <div className='PaymentInfoEdit__card'>
                            <div className='BillingHistory__cardHeader'>
                                <div className='BillingHistory__cardHeaderText'>
                                    <div className='BillingHistory__cardHeaderText-top'>
                                        {cta}
                                    </div>
                                    <div className='BillingHistory__cardHeaderText-bottom'>
                                        {description}
                                    </div>
                                </div>
                            </div>
                            <div className='BillingHistory__cardBody'>
                                {submitButton}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrueUpReview;
