// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { useDispatch, useSelector } from 'react-redux';

import { getTrueUpReviewBundle } from 'mattermost-redux/actions/cloud';
import { getTrueUpReviewProfile as trueUpReviewProfileSelector } from 'mattermost-redux/selectors/entities/cloud';

import moment from 'moment';
import { Buffer } from 'buffer';

import './true_up_review.scss'

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
	const [isAirGapped] = useState(true);
	const [dueBy] = useState('January 10, 2023');
	const reviewProfile = useSelector(trueUpReviewProfileSelector);

	const handleSubmitReview = () => {
		dispatch(getTrueUpReviewBundle());
	};

	const handleDownloadBundle = async () => {
		await dispatch(getTrueUpReviewBundle());

		const datestamp = moment().format('MM-DD-YYYY');

		
		// Create the bundle as a blob containing base64 encoded json data and assign it to a link element.
		const dataBuffer = Buffer.from(JSON.stringify(reviewProfile))
		const blob = new Blob([dataBuffer.toString('base64')], { type: 'application/text' });
		const href = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = href;
		link.download = `true-up-review-bundle-${datestamp}`;

		document.body.appendChild(link);
		link.click();

		// Remove link and revoke object url to avoid memory leaks.
		document.body.removeChild(link);
		URL.revokeObjectURL(href);
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
				{dueBy}
			</span>
		</div>
	)

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
				{dueDate}
				<FormattedMessage
					id='admin.billing.trueUpReview.share.data.for.review'
					defaultMessage='Share the below workspace data with Mattermost for your quarterly true-up Review.'
				/>
				{submitButton}
			</div>
		</div>
	);
};

export default TrueUpReview;
