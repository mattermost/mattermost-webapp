// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Modal} from 'react-bootstrap';

import './gather_intent.scss';
import {CheckCircleIcon} from '@mattermost/compass-icons/components';

export interface GatherIntentModalProps {
    onClose: () => void;
}

export const GatherIntentSubmittedModal = ({onClose}: GatherIntentModalProps) => {
    return (
        <>
            <Modal.Header className='GatherIntentModal__header '>
                <button
                    id='closeIcon'
                    className='icon icon-close'
                    aria-label='Close'
                    title='Close'
                    onClick={onClose}
                />
            </Modal.Header>
            <Modal.Body className='GatherIntentModal__body'>
                <div className='GatherIntentModal__submitted-icon-container'>
                    <CheckCircleIcon/>
                </div>
                <FormattedMessage
                    id='gather_intent.feedback_saved'
                    defaultMessage='Thanks for sharing feedback!'
                >
                    {(text) => <span className='savedFeedback__text'>{text}</span>}
                </FormattedMessage>
            </Modal.Body>
            <Modal.Footer className={'GatherIntentModal__footer '}>
                <button
                    className={'GatherIntentModal__footer--primary'}
                    id={'feedbackSubmitedDone'}
                    type='button'
                    onClick={onClose}
                >
                    <FormattedMessage
                        id='generic.done'
                        defaultMessage='Done'
                    />
                </button>
            </Modal.Footer>
        </>);
};
