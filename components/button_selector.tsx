// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {AppSelectOption} from 'mattermost-redux/types/apps';

type Props = {
    id: string;
    value: string | null;
    onChange?: (value: AppSelectOption) => void;
    label?: React.ReactNode;
    labelClassName?: string;
    inputClassName?: string;
    helpText?: React.ReactNode;
    footer?: React.ReactNode;
    disabled?: boolean;
    shouldSubmit?: boolean;
    options?: AppSelectOption[] | null;
}

const defaultProps: Partial<Props> = {
    value: '',
    labelClassName: '',
    inputClassName: '',
};

const ButtonSelector: React.FC<Props> = (props: Props) => {
    const onClick = React.useCallback((value: AppSelectOption) => {
        if (props.onChange) {
            props.onChange(value);
        }
    }, [props.onChange]);

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
                onClick={() => onClick(opt)}
                disabled={disabled}
            >
                {opt.label}
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
