// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import crypto from 'crypto';

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import SetByEnv from './set_by_env';

export default class GeneratedSetting extends React.Component {
    static get propTypes() {
        return {
            id: PropTypes.string.isRequired,
            label: PropTypes.node.isRequired,
            placeholder: PropTypes.string,
            value: PropTypes.string.isRequired,
            onChange: PropTypes.func.isRequired,
            disabled: PropTypes.bool.isRequired,
            setByEnv: PropTypes.bool.isRequired,
            disabledText: PropTypes.node,
            helpText: PropTypes.node.isRequired,
            regenerateText: PropTypes.node,
            regenerateHelpText: PropTypes.node,
        };
    }

    static get defaultProps() {
        return {
            disabled: false,
            regenerateText: (
                <FormattedMessage
                    id='admin.regenerate'
                    defaultMessage='Regenerate'
                />
            ),
        };
    }

    constructor(props) {
        super(props);

        this.regenerate = this.regenerate.bind(this);
    }

    regenerate(e) {
        e.preventDefault();

        this.props.onChange(this.props.id, crypto.randomBytes(256).toString('base64').substring(0, 32));
    }

    render() {
        let disabledText = null;
        if (this.props.disabled && this.props.disabledText) {
            disabledText = (
                <div className='admin-console__disabled-text'>
                    {this.props.disabledText}
                </div>
            );
        }

        let regenerateHelpText = null;
        if (this.props.regenerateHelpText) {
            regenerateHelpText = (
                <div className='help-text'>
                    {this.props.regenerateHelpText}
                </div>
            );
        }

        let text = this.props.value;
        if (!text) {
            text = (
                <span className='placeholder-text'>{this.props.placeholder}</span>
            );
        }

        return (
            <div className='form-group'>
                <label
                    className='control-label col-sm-4'
                    htmlFor={this.props.id}
                >
                    {this.props.label}
                </label>
                <div className='col-sm-8'>
                    <div
                        className='form-control disabled'
                        id={this.props.id}
                    >
                        {text}
                    </div>
                    {disabledText}
                    <div className='help-text'>
                        {this.props.helpText}
                    </div>
                    <div className='help-text'>
                        <button
                            className='btn btn-default'
                            onClick={this.regenerate}
                            disabled={this.props.disabled || this.props.setByEnv}
                        >
                            {this.props.regenerateText}
                        </button>
                    </div>
                    {regenerateHelpText}
                    {this.props.setByEnv ? <SetByEnv/> : null}
                </div>
            </div>
        );
    }
}
