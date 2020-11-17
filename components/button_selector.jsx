// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class ButtonSelector extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func,
        label: PropTypes.node,
        labelClassName: PropTypes.string,
        inputClassName: PropTypes.string,
        helpText: PropTypes.node,
        footer: PropTypes.node,
        disabled: PropTypes.bool,
        shouldSubmit: PropTypes.bool,
        options: PropTypes.array,
    };

    static defaultProps = {
        value: '',
        labelClassName: '',
        inputClassName: '',
    };

    onClick = (value) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.id, value);
        }
    }

    render() {
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
        } = this.props;

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

        const buttons = options.map((opt) => {
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
                    onClick={() => this.onClick(opt.value)}
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
    }
}
