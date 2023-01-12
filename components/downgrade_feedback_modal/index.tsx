// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GenericModal} from '@mattermost/components';
import { DowngradeFeedback } from '@mattermost/types/cloud';
import {closeModal} from 'actions/views/modals';
import RadioButtonGroup from 'components/common/radio_group';
import React, {useState} from 'react';
import { useDispatch } from 'react-redux';
import {ModalIdentifiers} from 'utils/constants';

import './index.scss';

type Props = {
    onSubmit: (downgradeFeedback: DowngradeFeedback) => void
}

export default function DowngradeFeedbackModal(props: Props) {
    const optionOther = 'Other';
    const feedbackOptions: string[] = [
        "Experienced technical issues",
        "No longer need Cloud Professional features",
        "Exploring other solutions",
        "Too expensive",
        optionOther,
    ]

    const [reason, setReason] = useState('');
    const [comments, setComments] = useState('');
    const [reasonNotSelected, setReasonNotSelected] = useState(false);
    const [commentsNotProvided, setCommentsNotProvided] = useState(false);
    const dispatch = useDispatch();

    const handleSubmitFeedback = () => {
        if (!reason) {
            setReasonNotSelected(true);
            return;
        }
        setReasonNotSelected(false);

        setComments(comments.trim())
        if (reason == optionOther && !comments) {
            setCommentsNotProvided(true);
            return;
        }
        setCommentsNotProvided(false);

        props.onSubmit({reason, comments});
        dispatch(closeModal(ModalIdentifiers.DOWNGRADE_FEEDBACK));
    }

    return (
        <GenericModal
            onExited={() => {
                dispatch(closeModal(ModalIdentifiers.DOWNGRADE_FEEDBACK));
            }}
        >
            <RadioButtonGroup
                id='downgradeFeedbackRadioGroup'
                testId='downgradeFeedbackRadioGroup'
                values={feedbackOptions.map((option, i) => {
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
                    onChange={(e) => {setComments(e.target.value)}}
                />
                {reasonNotSelected ? <span className='DowngradeFeedback__Error'>Please select a reason</span> : <></>}
                {commentsNotProvided ? <span className='DowngradeFeedback__Error'>Please some comments</span> : <></>}
                <button
                    className='btn btn-primary'
                    style={{width: '25%'}}
                    onClick={handleSubmitFeedback}
                >
                    Submit
                </button>
            </div>
        </GenericModal>
    )
}
