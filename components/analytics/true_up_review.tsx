// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';

import {useDispatch, useSelector} from 'react-redux';

import moment from 'moment';

import {Buffer} from 'buffer';

import {getTrueUpReviewBundle, getTrueUpReviewStatus} from 'mattermost-redux/actions/cloud';
import {
    getTrueUpReviewProfile as trueUpReviewProfileSelector,
    getTrueUpReviewStatus as trueUpReviewStatusSelector,
} from 'mattermost-redux/selectors/entities/cloud';

import useCanSelfHostedSignup from 'components/common/hooks/useCanSelfHostedSignup';
import CheckMarkSvg from 'components/widgets/icons/check_mark_icon';

import './true_up_review.scss';

const SendReviewButton = styled.button`
background: var(--denim-button-bg);
border-radius: 4px;
border: none;
box-shadow: none;
height: 40px;
width: 181px;
font-family: 'Open Sans';
font-style: normal;
font-weight: 600;
line-height: 10px;
letter-spacing: 0.02em;
font-size: 14px;
color: var(--button-color);
`;

const TrueUpReview: React.FC = () => {
    const dispatch = useDispatch();
    const isAirGapped = !useCanSelfHostedSignup();
    const reviewProfile = useSelector(trueUpReviewProfileSelector);
    const reviewStatus = useSelector(trueUpReviewStatusSelector);

    useEffect(() => {
        dispatch(getTrueUpReviewStatus());
    }, [dispatch, getTrueUpReviewStatus]);

    const formattedDueDate = (): string => {
        if (!reviewStatus?.due_date) {
            return '';
        }

        // Convert from miliseconds
        const date = new Date(reviewStatus.due_date * 1000);
        return moment(date).format('MMMM DD, YYYY');
    };

    const handleSubmitReview = () => {
        dispatch(getTrueUpReviewBundle());
        dispatch(getTrueUpReviewStatus());
    };

    const handleDownloadBundle = async () => {
        await dispatch(getTrueUpReviewBundle());

        // Create the bundle as a blob containing base64 encoded json data and assign it to a link element.
        const dataBuffer = Buffer.from(JSON.stringify(reviewProfile));
        const blob = new Blob([dataBuffer.toString('base64')], {type: 'application/text'});
        const href = URL.createObjectURL(blob);

        const link = document.createElement('a');
        const datestamp = moment().format('MM-DD-YYYY');
        link.href = href;
        link.download = `true-up-review-bundle-${datestamp}`;

        document.body.appendChild(link);
        link.click();

        // Remove link and revoke object url to avoid memory leaks.
        document.body.removeChild(link);
        URL.revokeObjectURL(href);

        dispatch(getTrueUpReviewStatus());
    };

    const dueDate = (
        <div className='dueDate'>
            <span>
                <FormattedMessage
                    id='admin.billing.trueUpReview.due.date'
                    defaultMessage='Due '
                />
            </span>
            <span>
                {formattedDueDate()}
            </span>
        </div>
    );

    const submitButton = (
        <SendReviewButton onClick={isAirGapped ? handleDownloadBundle : handleSubmitReview}>
            {isAirGapped ?
                <FormattedMessage
                    id='admin.billing.trueUpReview.button.download'
                    defaultMessage='Download Data'
                /> :
                <FormattedMessage
                    id='admin.billing.trueUpReview.button.share'
                    defaultMessage='Share to Mattermost'
                />
            }
        </SendReviewButton>
    );

    const successStatus = (
        <>
            <CheckMarkSvg/>
            <FormattedMessage
                id='admin.billing.trueUpReview.submit.success'
                defaultMessage='Success!'
            />
            <FormattedMessage
                id='admin.billing.trueUpReview.submit.thanks.for.sharing'
                defaultMessage='Thanks for sharing data needed for your true-up review.'
            />
        </>
    );

    const reviewDetails = (
        <>
            {dueDate}
            <FormattedMessage
                id='admin.billing.trueUpReview.share.data.for.review'
                defaultMessage='Share the below workspace data with Mattermost for your quarterly true-up Review.'
            />
            {submitButton}
        </>
    );

    const cardContent = () => {
        // If the due date is empty we still have the default state.
        if (reviewStatus.due_date === 0) {
            return null;
        }

        if (reviewStatus.complete) {
            return successStatus;
        }

        return reviewDetails;
    };

    return (
        <div className='TrueUpReview__card'>
            <div className='TrueUpReview__cardHeader'>
                <div className='TrueUpReview__cardHeaderText'>
                    <div className='TrueUpReview__cardheaderText-top'>
                        <FormattedMessage
                            id='admin.billing.trueUpReview.title'
                            defaultMessage='True Up Review'
                        />
                    </div>
                </div>
            </div>
            <div className='TrueUpReview__cardBody'>
                {cardContent()}
            </div>
        </div>
    );
};

export default TrueUpReview;
