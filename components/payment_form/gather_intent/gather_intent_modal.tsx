// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {Modal} from 'react-bootstrap';

import './gather_intent.scss';
import {FormDataState} from './useGatherIntent';

export interface GatherIntentModalProps {
    onClose: () => void;
    onSave: (formData: FormDataState) => void;
    isSubmitting: boolean;
    showError: boolean;
}

const isOtherUnchecked = (name: string, value: boolean): boolean => {
    return name === 'other' && value === false;
};

const isEmptyInput = (value: undefined | string) => {
    return value == null || value.trim() === '';
};

const isFormEmpty = (formDataState: FormDataState) => {
    if (formDataState.other) {
        return isEmptyInput(formDataState.otherPayment) && !formDataState.wire && !formDataState.ach;
    }

    return Object.values(formDataState).every((value) => value === false || value == null);
};

export const GatherIntentModal = ({onClose, onSave, isSubmitting, showError}: GatherIntentModalProps) => {
    const [formState, setFormState] = useState<FormDataState>({
        ach: false,
        wire: false,
        other: false,
        otherPayment: undefined,
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        onSave(formState);
    };

    const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const {name, value} = event.target;

        setFormState((formDataState) => ({
            ...formDataState,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, checked} = event.target;

        if (isOtherUnchecked(name, checked)) {
            setFormState((formDataState) => ({
                ...formDataState,
                other: false,
                otherPayment: undefined,
            }));
        }

        setFormState((formDataState) => ({
            ...formDataState,
            [name]: checked,
        }));
    };

    return (
        <>
            <Modal.Header className='GatherIntentModal__header '>
                <FormattedMessage
                    id={'payment_form.gather_wire_transfer_intent_title'}
                    defaultMessage='Alternate Payment Options'
                >
                    {(text) => (
                        <h3 className='Form-section-title'>
                            {text}
                        </h3>)
                    }
                </FormattedMessage>
                <button
                    id='closeIcon'
                    className='icon icon-close'
                    aria-label='Close'
                    title='Close'
                    onClick={onClose}
                />
            </Modal.Header>
            <Modal.Body>
                <form
                    id='gather_intent_wire_transfer'
                    className='Form'
                    onSubmit={handleSubmit}
                >
                    <FormattedMessage
                        id='payment_form.gather_wire_transfer_intent_modal.question'
                        defaultMessage='Which payment options are you interested in using?'
                    >
                        {(text) => <p className='GatherIntentModal__body__question'>{text}</p>}
                    </FormattedMessage>
                    <div className='Form-checkbox GatherIntentModal__body__option'>
                        <input
                            className='GatherIntentModal__body__checkbox'
                            id='wire'
                            name='wire'
                            type='checkbox'
                            checked={formState.wire}
                            onChange={handleCheckboxChange}
                        />
                        <FormattedMessage
                            id='payment_form.gather_wire_transfer_intent_modal.wire'
                            defaultMessage='Wire'
                        >
                            {(text) => (
                                <label
                                    className='GatherIntentModal__body__label'
                                    htmlFor='wire'
                                >
                                    {text}
                                </label>)
                            }
                        </FormattedMessage>
                    </div>
                    <div className='GatherIntentModal__body__option'>
                        <input
                            className='GatherIntentModal__body__checkbox'
                            id='ach'
                            name='ach'
                            type='checkbox'
                            checked={formState.ach}
                            onChange={handleCheckboxChange}
                        />
                        <FormattedMessage
                            id='payment_form.gather_wire_transfer_intent_modal.ach'
                            defaultMessage='ACH'
                        >
                            {(text) => (
                                <label
                                    className='GatherIntentModal__body__label'
                                    htmlFor='ach'
                                >
                                    {text}
                                </label>)
                            }
                        </FormattedMessage>
                    </div>
                    <div className='Form-checkbox GatherIntentModal__body__option'>
                        <input
                            className='GatherIntentModal__body__checkbox'
                            id='other'
                            name='other'
                            type='checkbox'
                            checked={formState.other}
                            onChange={handleCheckboxChange}
                        />
                        <FormattedMessage
                            id='payment_form.gather_wire_transfer_intent_modal.other'
                            defaultMessage='Other'
                        >
                            {(text) => (
                                <label
                                    className='GatherIntentModal__body__label'
                                    htmlFor='other'
                                >
                                    {text}
                                </label>)
                            }
                        </FormattedMessage>
                    </div>
                    {formState.other && <div className='Form-row'>
                        <textarea
                            id='other-payment-method'
                            name='otherPayment'
                            className='GatherIntentModal__body__textarea'
                            value={formState.otherPayment}
                            onChange={handleTextAreaChange}
                            placeholder={'Enter payment option here'}
                            rows={2}
                        />
                    </div>}

                </form>
            </Modal.Body>
            <Modal.Footer className={'GatherIntentModal__footer '}>
                {showError &&
                    <FormattedMessage
                        id='gather_intent.error_feedback'
                        defaultMessage='Sorry, there was an error sending feedback. Please try again.'
                    >
                        {(text) => <span className='GatherIntentModal__footer__error'>{text}</span>}
                    </FormattedMessage>}
                <button
                    className={'GatherIntentModal__footer--secondary'}
                    id={'stayOnFremium'}
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    <FormattedMessage
                        id='payment_form.gather_wire_transfer_intent_modal.cancel'
                        defaultMessage='Cancel'
                    />
                </button>

                <button
                    className={'GatherIntentModal__footer--primary'}
                    id={'updanteBillingFromDeliquencyModal'}
                    type='submit'
                    form='gather_intent_wire_transfer'
                    disabled={isFormEmpty(formState) || isSubmitting}
                >
                    <FormattedMessage
                        id='payment_form.gather_wire_transfer_intent_modal.save'
                        defaultMessage='Save'
                    />
                </button>
            </Modal.Footer>
        </>);
};
