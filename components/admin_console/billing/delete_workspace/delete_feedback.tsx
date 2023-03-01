// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {injectIntl, WrappedComponentProps} from 'react-intl';

import {Feedback} from '@mattermost/types/cloud';
import FeedbackModal from 'components/feedback_modal/feedback';

type Props = {
    onSubmit: (deleteFeedback: Feedback) => void;
} &WrappedComponentProps

const DeleteFeedbackModal = (props: Props) => {
    const deleteFeedbackModalTitle = props.intl.formatMessage({
        id: 'feedback.deleteWorkspace.feedbackTitle',
        defaultMessage: 'Please share your reason for deleting',
    });

    const placeHolder = props.intl.formatMessage({
        id: 'feedback.deleteWorkspace.feedbackPlaceholder',
        defaultMessage: 'Please tell us why you are deleting',
    });

    const deleteButtonText = props.intl.formatMessage({
        id: 'feedback.deleteWorkspace.submitText',
        defaultMessage: 'Delete Workspace',
    });

    const deleteFeedbackOptions = [
        props.intl.formatMessage({
            id: 'feedback.deleteWorkspace.feedbackNoValue',
            defaultMessage: 'No longer found value',
        }),
        props.intl.formatMessage({
            id: 'feedback.deleteWorkspace.feedbackMoving',
            defaultMessage: 'Moving to a different solution',
        }),
        props.intl.formatMessage({
            id: 'feedback.deleteWorkspace.feedbackMistake',
            defaultMessage: 'Created a workspace by mistake',
        }),
        props.intl.formatMessage({
            id: 'feedback.deleteWorkspace.feedbackHosting',
            defaultMessage: 'Moving to hosting my own Mattermost instance (self-hosted)',
        }),
    ];

    return (
        <FeedbackModal
            title={deleteFeedbackModalTitle}
            feedbackOptions={deleteFeedbackOptions}
            freeformTextPlaceholder={placeHolder}
            submitText={deleteButtonText}
            onSubmit={props.onSubmit}
        />
    );
};

export default injectIntl(DeleteFeedbackModal);
