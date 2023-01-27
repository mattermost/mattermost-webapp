// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';
import classNames from 'classnames';

import {GenericModal} from '@mattermost/components';
import {Feedback} from '@mattermost/types/cloud';
import {closeModal} from 'actions/views/modals';
import RadioButtonGroup from 'components/common/radio_group';

import {ModalIdentifiers} from 'utils/constants';

import './feedback.scss';

type Props = {
    onSubmit: (feedback: Feedback) => void;
    title: string;
    submitText: string;
    feedbackOptions: string[];
    freeformTextPlaceholder: string;
}

export default function FeedbackModal(props: Props) {
    const optionOther = 'Other';
    const FeedbackModalOptions: string[] = [
        ...props.feedbackOptions,
        optionOther,
    ];

    const [reason, setReason] = useState('');
    const [comments, setComments] = useState('');
    const reasonNotSelected = reason === '';
    const commentsNotProvided = comments.trim() === '';
    const submitDisabled = reasonNotSelected || (reason === optionOther && commentsNotProvided);

    const dispatch = useDispatch();

    const handleSubmitFeedbackModal = () => {
        if (submitDisabled) {
            return;
        }

        props.onSubmit({reason, comments: comments.trim()});
        dispatch(closeModal(ModalIdentifiers.FEEDBACK));
    };

    const handleCancel = () => {
        dispatch(closeModal(ModalIdentifiers.FEEDBACK));
    };

    return (
        <GenericModal
            onExited={handleCancel}
            className='FeedbackModal__Container'
        >
            <span className='FeedbackModal__Title'>
                {props.title}
            </span>
            <RadioButtonGroup
                id='FeedbackModalRadioGroup'
                testId='FeedbackModalRadioGroup'
                values={FeedbackModalOptions.map((option) => {
                    return {
                        value: option,
                        key: option,
                        testId: option,
                    };
                })}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />
            <textarea
                className='FeedbackModal__FreeFormText'
                placeholder={props.freeformTextPlaceholder}
                rows={3}
                onChange={(e) => {
                    setComments(e.target.value);
                }}
                style={{display: reason === optionOther ? '' : 'none'}}
            />
            <div className='FeedbackModal__Submit'>
                <button
                    className='btn btn-secondary'
                    onClick={handleCancel}
                >
                    <FormattedMessage
                        id={'feedback.cancel'}
                        defaultMessage={'Cancel'}
                    />
                </button>
                <button
                    disabled={submitDisabled}
                    className={classNames('btn btn-primary', {disabled: submitDisabled})}
                    onClick={handleSubmitFeedbackModal}
                >
                    {props.submitText}
                </button>
            </div>
        </GenericModal>
    );
}
