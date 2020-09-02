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
    textPrefix?: string;
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
            <div className='Input___error'>
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
            <div className='Input___info'>
                {this.props.info}
            </div>
        );
    }

    public render() {
        const {value, placeholder, className, error: propError, hasError, addon, name, textPrefix, ...otherProps} = this.props;
        const {focused, error: stateError} = this.state;
        let inputClass = className ? `Input form-control ${className}` : 'Input form-control';
        let fieldsetClass = className ? `Input_fieldset ${className}` : 'Input_fieldset';
        let fieldsetErrorClass = className ? `Input_fieldset Input_fieldset___error ${className}` : 'Input_fieldset Input_fieldset___error';
        const showLegend = Boolean(focused || value);

        inputClass = showLegend ? inputClass + ' Input___focus' : inputClass;
        fieldsetClass = showLegend ? fieldsetClass + ' Input_fieldset___legend' : fieldsetClass;
        fieldsetErrorClass = showLegend ? fieldsetErrorClass + ' Input_fieldset___legend' : fieldsetErrorClass;

        const error = propError || stateError;

        return (
            <div className='Input_container'>
                <fieldset className={error || hasError ? fieldsetErrorClass : fieldsetClass}>
                    <legend className={showLegend ? 'Input_legend Input_legend___focus' : 'Input_legend'}>{showLegend ? placeholder : null}</legend>
                    <div className='Input_wrapper'>
                        {textPrefix && <span>{textPrefix}</span>}
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
                    </div>
                    {addon}
                </fieldset>
                {error ? this.renderError(error) : this.renderInfo()}
            </div>
        );
    }
}
