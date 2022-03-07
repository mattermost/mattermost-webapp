// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {injectIntl, IntlShape} from 'react-intl';

import './input.scss';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    intl: IntlShape;
    info?: string;
    error?: string;
    required?: boolean;
    hasError?: boolean;
    addon?: React.ReactElement;
    textPrefix?: string;
    label?: string;
    containerClassName?: string;
    inputClassName?: string;
    limit?: number;
}

type State = {
    focused: boolean;
    error: string;
}

export class Input extends React.PureComponent<Props, State> {
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
        const {formatMessage} = this.props.intl;

        this.setState({error: ''});
        if (required && (value == null || value === '')) {
            this.setState({
                error: formatMessage({
                    id: 'widget.input.required',
                    defaultMessage: 'This field is required',
                }),
            });
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
        const {value, label, placeholder, className, error: propError, hasError, addon, name, textPrefix, containerClassName, inputClassName, limit, maxLength, ...otherProps} = this.props;
        const {focused, error: stateError} = this.state;

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
                    <legend className={classNames('Input_legend', {Input_legend___focus: showLegend})}>
                        {showLegend ? label || placeholder : null}
                    </legend>
                    <div className='Input_wrapper'>
                        {textPrefix && <span>{textPrefix}</span>}
                        <input
                            id={`input_${name || ''}`}
                            className={classNames('Input form-control', inputClassName, {Input__focus: showLegend})}
                            value={value}
                            placeholder={focused ? (label && placeholder) || label : label || placeholder}
                            name={name}
                            {...otherProps}
                            maxLength={limit ? undefined : maxLength}
                            onFocus={this.onFocus}
                            onBlur={this.onBlur}
                            onChange={this.onChange}
                        />
                        {limitExceeded > 0 && <span className='Input_limit-exceeded'>{'-'}{limitExceeded}</span>}
                    </div>
                    {addon}
                </fieldset>
                {error ? this.renderError(error) : this.renderInfo()}
            </div>
        );
    }
}

export default injectIntl(Input);
