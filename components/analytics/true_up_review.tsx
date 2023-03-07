// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import moment from 'moment';

import {getTrueUpReviewBundle, getTrueUpReviewStatus} from 'actions/hosted_customer';
import {
    isCurrentLicenseCloud,
} from 'mattermost-redux/selectors/entities/cloud';

import {
    getSelfHostedErrors,
    getTrueUpReviewProfile as trueUpReviewProfileSelector,
    getTrueUpReviewStatus as trueUpReviewStatusSelector,
} from 'mattermost-redux/selectors/entities/hosted_customer';

import useCanSelfHostedSignup from 'components/common/hooks/useCanSelfHostedSignup';
import CheckMarkSvg from 'components/widgets/icons/check_mark_icon';

import './true_up_review.scss';
import {GlobalState} from '@mattermost/types/store';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import classNames from 'classnames';

const TrueUpReview: React.FC = () => {
    const dispatch = useDispatch();
    const isCloud = useSelector(isCurrentLicenseCloud);
    const isAirGapped = !useCanSelfHostedSignup();
    const reviewProfile = useSelector(trueUpReviewProfileSelector);
    const reviewStatus = useSelector(trueUpReviewStatusSelector);
    const isSystemAdmin = useSelector(isCurrentUserSystemAdmin);
    const license = useSelector(getLicense);
    const [submitted, setSubmitted] = useState(false);
    const trueUpReviewError = useSelector((state: GlobalState) => {
        const errors = getSelfHostedErrors(state);
        return Boolean(errors.trueUpReview);
    });

    useEffect(() => {
        dispatch(getTrueUpReviewStatus());
    }, [dispatch, getTrueUpReviewStatus]);

    // Download the review profile as a base64 encoded json file when the review request is submitted.
    useEffect(() => {
        if (submitted && isAirGapped && !trueUpReviewError && reviewProfile.content.length > 0) {
            // Create the bundle as a blob containing base64 encoded json data and assign it to a link element.
            const blob = new Blob([reviewProfile.content], {type: 'application/text'});
            const href = URL.createObjectURL(blob);

            const link = document.createElement('a');
            const date = moment().format('MM-DD-YYYY');
            link.href = href;
            link.download = `True Up-${license.Id}-${date}.txt`;
            document.body.appendChild(link);
            link.click();

            // Remove link and revoke object url to avoid memory leaks.
            document.body.removeChild(link);
            URL.revokeObjectURL(href);

            dispatch(getTrueUpReviewStatus());
        }
    }, [isAirGapped, submitted, reviewProfile]);

    const formattedDueDate = (): string => {
        if (!reviewStatus?.due_date) {
            return '';
        }

        // Convert from milliseconds
        const date = new Date(reviewStatus.due_date);
        return moment(date).format('MMMM DD, YYYY');
    };

    const handleSubmitReview = () => {
        dispatch(getTrueUpReviewBundle());
        dispatch(getTrueUpReviewStatus());
        setSubmitted(true);
    };

    const handleDownloadBundle = () => {
        dispatch(getTrueUpReviewBundle());

        // Set submitted to true download the bundle data via useEffect
        // (the selector for the review profile would only return the initial state without doing this).
        setSubmitted(true);
    };

    const dueDate = (
        <div className='TrueUpReview__dueDate'>
            <span>
                <FormattedMessage
                    id='admin.billing.trueUpReview.due_date'
                    defaultMessage='Due '
                />
            </span>
            <span>
                {formattedDueDate()}
            </span>
        </div>
    );

    const submitButton = (
        <button
            className={classNames({'btn btn-primary TrueUpReview__submit': !trueUpReviewError}, {'TrueUpReview__submit--error': trueUpReviewError})}
            onClick={isAirGapped ? handleDownloadBundle : handleSubmitReview}
        >
            {isAirGapped ?
                <FormattedMessage
                    id='admin.billing.trueUpReview.button_download'
                    defaultMessage='Download Data'
                /> :
                <FormattedMessage
                    id='admin.billing.trueUpReview.button_share'
                    defaultMessage='Share to Mattermost'
                />
            }
        </button>
    );

    const errorStatus = (
        <>
            <WarningIcon additionalClassName={'TrueUpReview__warning'}/>
            <FormattedMessage
                id='admin.billing.trueUpReview.submit_error'
                defaultMessage='There was an issue sending your True Up Review. Please try again.'
            />
            {submitButton}
        </>
    );

    const successStatus = (
        <>
            <CheckMarkSvg/>
            <FormattedMessage
                id='admin.billing.trueUpReview.submit_success'
                defaultMessage='Success!'
            />
            <FormattedMessage
                id='admin.billing.trueUpReview.submit.thanks_for_sharing'
                defaultMessage='Thanks for sharing data needed for your true-up review.'
            />
        </>
    );

    const reviewDetails = (
        <>
            {dueDate}
            <FormattedMessage
                id='admin.billing.trueUpReview.share_data_for_review'
                defaultMessage='Share the below workspace data with Mattermost for your quarterly true-up Review.'
            />
            {submitButton}
        </>
    );

    const cardContent = () => {
        if (trueUpReviewError) {
            return errorStatus;
        }

        // If the due date is empty we still have the default state.
        if (reviewStatus.due_date === 0) {
            return null;
        }

        // If we just submitted and the review status is set as complete, show the success
        // status details.
        if (submitted) {
            return successStatus;
        }

        return reviewDetails;
    };

    // Only show the true up review section if the user is an admin and we're not using a cloud instance.
    if (isCloud || !isSystemAdmin) {
        return null;
    }

    // Only display the review details if we are within 2 weeks of the review due date.
    const visibilityStart = moment(reviewStatus.due_date).subtract(2, 'weeks');
    if (moment().isBefore(visibilityStart)) {
        return null;
    }

    // If the review has already been submitted, don't show anything.
    if (!submitted && reviewStatus.complete) {
        return null;
    }

    return (
        <div className='TrueUpReview__card'>
            <div className='TrueUpReview__cardHeader'>
                <div className='TrueUpReview__cardHeaderText'>
                    <div className='TrueUpReview__cardHeaderText-top'>
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
