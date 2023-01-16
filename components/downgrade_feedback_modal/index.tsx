// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

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

    const [feedbackChanged, setFeedbackChanged] = useState(false);
    const [reason, setReason] = useState('');
    const [comments, setComments] = useState('');
    const reasonNotSelected = reason === '';
    const commentsNotProvided = comments === '';

    const dispatch = useDispatch();

    const handleSubmitFeedback = () => {
        if (!reason) {
            return;
        }

        setFeedbackChanged(true);

        setComments(comments.trim());
        if (reason === optionOther && !comments) {
            return;
        }

        props.onSubmit({reason, comments});
        dispatch(closeModal(ModalIdentifiers.DOWNGRADE_FEEDBACK));
    };

    return (
        <GenericModal
            onExited={() => {
                dispatch(closeModal(ModalIdentifiers.DOWNGRADE_FEEDBACK));
            }}
        >
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
            <div className='DowngradeFeedback__Submit'>
                <textarea
                    className='DowngradeFeedback__FreeFormText'
                    placeholder='Please tell us why you are downgrading...'
                    rows={4}
                    onChange={(e) => {
                        setComments(e.target.value);
                    }}
                />
                {feedbackChanged && reasonNotSelected ?
                    <span className='DowngradeFeedback__Error'>
                        <FormattedMessage
                            id={'downgrade_feedback.select_reason'}
                            defaultMessage={'Please select a reason'}
                        />
                    </span> : <></>}
                {feedbackChanged && reason === optionOther && commentsNotProvided ?
                    <span className='DowngradeFeedback__Error'>
                        <FormattedMessage
                            id={'downgrade_feedback.tell_us_why'}
                            defaultMessage={'Please tell us why you are downgrading'}
                        />
                    </span> : <></>}
                <button
                    disabled={reasonNotSelected || (reason === optionOther && commentsNotProvided)}
                    className='btn btn-primary'
                    style={{width: '25%'}}
                    onClick={handleSubmitFeedback}
                >
                    <FormattedMessage
                        id={'downgrade_feedback.submit'}
                        defaultMessage={'Submit'}
                    />
                </button>
            </div>
        </GenericModal>
    );
}
