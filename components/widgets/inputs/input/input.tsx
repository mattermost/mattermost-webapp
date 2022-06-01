// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import './input.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    info?: string;
    error?: string;
    required?: boolean;
    hasError?: boolean;
    addon?: React.ReactElement;
    textPrefix?: string;
    inputPrefix?: JSX.Element;
    inputSuffix?: JSX.Element;
    label?: string;
    containerClassName?: string;
    wrapperClassName?: string;
    inputClassName?: string;
    limit?: number;
    useLegend?: boolean;
}

function Input({
    name,
    value,
    label,
    placeholder,
    useLegend = true,
    className,
    info,
    error: propError,
    hasError,
    required,
    addon,
    textPrefix,
    inputPrefix,
    inputSuffix,
    containerClassName,
    wrapperClassName,
    inputClassName,
    limit,
    maxLength,
    onFocus,
    onBlur,
    onChange,
    ...otherProps
}: InputProps) {
    const {formatMessage} = useIntl();

    const [focused, setFocused] = useState(false);
    const [stateError, setStateError] = useState('');

    const handleOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true);

        if (onFocus) {
            onFocus(event);
        }
    };

    const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        validateInput();

        if (onBlur) {
            onBlur(event);
        }
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStateError('');

        if (onChange) {
            onChange(event);
        }
    };

    const validateInput = () => {
        setStateError(required && (value == null || value === '') ? (
            formatMessage({
                id: 'widget.input.required',
                defaultMessage: 'This field is required',
            })) : '',
        );
    };

    const showLegend = Boolean(focused || value);
    const error = propError || stateError;
    const limitExceeded = limit && value && !Array.isArray(value) ? value.toString().length - limit : 0;

    return (
        <div className={classNames('Input_container', containerClassName)}>
            <fieldset
                className={classNames('Input_fieldset', className, {
                    Input_fieldset___error: error || hasError || limitExceeded > 0,
                    Input_fieldset___legend: showLegend,
                })}
            >
                {useLegend && (
                    <legend className={classNames('Input_legend', {Input_legend___focus: showLegend})}>
                        {showLegend ? label || placeholder : null}
                    </legend>
                )}
                <div className={classNames('Input_wrapper', wrapperClassName)}>
                    {inputPrefix}
                    {textPrefix && <span>{textPrefix}</span>}
                    <input
                        id={`input_${name || ''}`}
                        className={classNames('Input form-control', inputClassName, {Input__focus: showLegend})}
                        value={value}
                        placeholder={focused ? (label && placeholder) || label : label || placeholder}
                        name={name}
                        {...otherProps}
                        maxLength={limit ? undefined : maxLength}
                        onFocus={handleOnFocus}
                        onBlur={handleOnBlur}
                        onChange={handleOnChange}
                    />
                    {limitExceeded > 0 && (
                        <span className='Input_limit-exceeded'>
                            {'-'}{limitExceeded}
                        </span>
                    )}
                    {inputSuffix}
                </div>
                {addon}
            </fieldset>
            {error ? (
                <div className='Input___error'>
                    <i className='icon icon-alert-outline'/>
                    <span>{error}</span>
                </div>
            ) : info && (
                <div className='Input___info'>
                    {info}
                </div>
            )}
        </div>
    );
}

export default Input;
