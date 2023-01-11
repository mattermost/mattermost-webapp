// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GenericModal} from '@mattermost/components';
import RadioButtonGroup from 'components/common/radio_group';
import Textbox from 'components/textbox';
import {capitalize} from 'lodash';
import React, {useState} from 'react';

export default function DowngradeFeedbackModal() {
    const optionOther = 'other';

    const feedbackOptions: string[] = [
        "experienced technical issues",
        "no longer need Cloud Professional features",
        "exploring other solutions",
        "too expensive",
        optionOther,
    ]
    const [radioValue, setRadioValue] = useState('');
    const [customFeedbackEnabled, setCustomFeedbackEnabled] = useState(false);

    return (
        <GenericModal>
            <RadioButtonGroup
                id='downgradeFeedbackRadioGroup'
                testId='downgradeFeedbackRadioGroup'
                values={feedbackOptions.map((option, i) => {
                    return {
                        value: option,
                        key: capitalize(option),
                        testId: option,
                    };
                })}
                value={radioValue}
                onChange={(e) => setRadioValue(e.target.value)}
            />
            <div style={{display: 'flex', flexDirection: 'column', marginBottom: '10px'}}>
                <textarea
                    disabled={radioValue === optionOther}
                    placeholder='Please tell us why you are downgrading...'
                    style={{fontSize: '15px', marginBottom: '10px'}}
                />
                <button
                    className='btn btn-primary'
                    style={{width: '25%'}}
                >
                    Submit
                </button>
            </div>
        </GenericModal>
    )
}