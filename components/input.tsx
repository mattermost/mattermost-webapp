// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './input.css';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    info?: string;
    error?: string;
    required?: boolean;
    hasError?: boolean;
    addon?: React.ReactElement;
}

type State = {
    focused: boolean;
    error: string;
}

const REQUIRED_FIELD_TEXT = 'This field is required';

export default class Input extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            focused: false,
            error: '',
        };
    }

    private onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        const {onFocus} = this.props;

        this.setState({focused: true});

        if (onFocus) {
            onFocus(event);
        }
    }

    private onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const {onBlur} = this.props;

        this.setState({focused: false});
        this.validateInput();

        if (onBlur) {
            onBlur(event);
        }
    }

    private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {onChange} = this.props;

        this.setState({error: ''});

        if (onChange) {
            onChange(event);
        }
    }

    private validateInput = () => {
        const {value, required} = this.props;
        this.setState({error: ''});
        if (required && (value == null || value === '')) {
            this.setState({error: REQUIRED_FIELD_TEXT});
        }
    }

    private renderError(error: string) {
        if (!error) {
            return null;
        }

        return (
            <div className='Input-error'>
                <i className='icon icon-alert-outline'/>
                <span>{error}</span>
            </div>
        );
    }

    private renderInfo() {
        if (!this.props.info) {
            return null;
        }

        return (
            <div className='Input-info'>
                {this.props.info}
            </div>
        );
    }

    public render() {
        const {value, placeholder, className, error: propError, hasError, addon, name, ...otherProps} = this.props;
        const {focused, error: stateError} = this.state;
        let inputClass = className ? `Input ${className}` : 'Input';
        let fieldsetClass = className ? `Input-fieldset ${className}` : 'Input-fieldset';
        let fieldsetErrorClass = className ? `Input-fieldset Input-fieldset-error ${className}` : 'Input-fieldset Input-fieldset-error';
        const showLegend = Boolean(focused || value);

        inputClass = showLegend ? inputClass + ' Input-focus' : inputClass;
        fieldsetClass = showLegend ? fieldsetClass + ' Input-fieldset-legend' : fieldsetClass;
        fieldsetErrorClass = showLegend ? fieldsetErrorClass + ' Input-fieldset-legend' : fieldsetErrorClass;

        const error = propError || stateError;

        return (
            <div className='Input-container'>
                <fieldset className={error || hasError ? fieldsetErrorClass : fieldsetClass}>
                    <legend className={showLegend ? 'Input-legend Input-legend-focus' : 'Input-legend'}>{showLegend ? placeholder : null}</legend>
                    <input
                        id={`input_${name}`}
                        className={inputClass}
                        value={value}
                        placeholder={focused ? '' : placeholder}
                        name={name}
                        {...otherProps}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onChange={this.onChange}
                    />
                    {addon}
                </fieldset>
                {error ? this.renderError(error) : this.renderInfo()}
            </div>
        );
    }
}
