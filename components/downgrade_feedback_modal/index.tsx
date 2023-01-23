// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';
import classNames from 'classnames';

import {GenericModal} from '@mattermost/components';
import {DowngradeFeedback} from '@mattermost/types/cloud';
import {closeModal} from 'actions/views/modals';
import RadioButtonGroup from 'components/common/radio_group';

import {ModalIdentifiers} from 'utils/constants';

import './index.scss';

type Props = {
    onSubmit: (downgradeFeedback: DowngradeFeedback) => void;
}

export default function DowngradeFeedbackModal(props: Props) {
    const optionOther = 'Other';
    const feedbackOptions: string[] = [
        'Experienced technical issues',
        'No longer need Cloud Professional features',
        'Exploring other solutions',
        'Too expensive',
        optionOther,
    ];

    const [reason, setReason] = useState('');
    const [comments, setComments] = useState('');
    const reasonNotSelected = reason === '';
    const commentsNotProvided = comments.trim() === '';
    const downgradeDisabled = reasonNotSelected || (reason === optionOther && commentsNotProvided);

    const dispatch = useDispatch();

    const handleSubmitFeedback = () => {
        if (downgradeDisabled) {
            return;
        }

        props.onSubmit({reason, comments: comments.trim()});
        dispatch(closeModal(ModalIdentifiers.DOWNGRADE_FEEDBACK));
    };

    const handleCancel = () => {
        dispatch(closeModal(ModalIdentifiers.DOWNGRADE_FEEDBACK));
    };

    return (
        <GenericModal
            onExited={handleCancel}
            className='DowngradeFeedback__Container'
        >
            <span className='DowngradeFeedback__Title'>
                <FormattedMessage
                    id={'downgrade_feedback.title'}
                    defaultMessage={'Please share your reason for downgrading'}
                />
            </span>
            <RadioButtonGroup
                id='downgradeFeedbackRadioGroup'
                testId='downgradeFeedbackRadioGroup'
                values={feedbackOptions.map((option) => {
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
                className='DowngradeFeedback__FreeFormText'
                placeholder='Please tell us why you are downgrading...'
                rows={3}
                onChange={(e) => {
                    setComments(e.target.value);
                }}
                style={{display: reason === optionOther ? '' : 'none'}}
            />
            <div className='DowngradeFeedback__Submit'>
                <button
                    className='btn btn-secondary'
                    onClick={handleCancel}
                >
                    <FormattedMessage
                        id={'downgrade_feedback.cancel'}
                        defaultMessage={'Cancel'}
                    />
                </button>
                <button
                    disabled={downgradeDisabled}
                    className={classNames('btn btn-primary', {disabled: downgradeDisabled})}
                    onClick={handleSubmitFeedback}
                >
                    <FormattedMessage
                        id={'downgrade_feedback.downgrade'}
                        defaultMessage={'Downgrade'}
                    />
                </button>
            </div>
        </GenericModal>
    );
}
