// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    id: string;
    value: string | number | boolean | null;
    onChange?: (id: string, value: string) => void;
    label?: React.ReactNode;
    labelClassName?: string;
    inputClassName?: string;
    helpText?: React.ReactNode;
    footer?: React.ReactNode;
    disabled?: boolean;
    shouldSubmit?: boolean;
    options?: {text: string; value: string}[] | null;
}

const defaultProps: Partial<Props> = {
    value: '',
    labelClassName: '',
    inputClassName: '',
};

const ButtonSelector: React.FC<Props> = (props: Props) => {
    const onClick = (value: string) => {
        if (props.onChange) {
            props.onChange(props.id, value);
        }
    };

    const {
        footer,
        label,
        labelClassName,
        helpText,
        inputClassName,
        disabled,
        options,
        shouldSubmit,
        value,
    } = props;

    let labelContent;
    if (label) {
        labelContent = (
            <label
                className={'control-label ' + labelClassName}
            >
                {label}
            </label>
        );
    }

    let helpTextContent;
    if (helpText) {
        helpTextContent = (
            <div className='help-text'>
                {helpText}
            </div>
        );
    }

    const buttons = options?.map((opt) => {
        let className = 'btn btn-link';
        if (disabled) {
            className += ' btn-inactive';
        }
        if (opt.value === value) {
            className += '  btn-primary';
        }
        const type = shouldSubmit ? 'submit' : 'button';
        return (
            <button
                key={opt.value}
                type={type}
                className={className}
                onClick={() => onClick(opt.value)}
                disabled={disabled}
            >
                {opt.text}
            </button>
        );
    });

    return (
        <div
            data-testid='autoCompleteSelector'
            className='form-group'
        >
            {labelContent}
            <div className={inputClassName}>
                {buttons}
                {helpTextContent}
                {footer}
            </div>
        </div>
    );
};

ButtonSelector.defaultProps = defaultProps;

export default ButtonSelector;
