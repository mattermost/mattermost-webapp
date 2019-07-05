// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Setting from './setting.jsx';

export default class BoolSetting extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired,
        labelClassName: PropTypes.string,
        helpText: PropTypes.node,
        placeholder: PropTypes.string,
        value: PropTypes.bool.isRequired,
        inputClassName: PropTypes.string,
        maxLength: PropTypes.number,
        onChange: PropTypes.func,
        disabled: PropTypes.bool,
    };

    static defaultProps = {
        labelClassName: '',
        inputClassName: '',
        maxLength: null,
    };

    handleChange = (e) => {
        this.props.onChange(this.props.id, e.target.checked);
    }

    render() {
        let input = null;

        input = (
            <div className='checkbox'>
                <label>
                    <input
                        id={this.props.id}
                        type='checkbox'
                        checked={this.props.value}
                        onChange={this.handleChange}
                        disabled={this.props.disabled}
                    />
                    <span>{this.props.placeholder}</span>
                </label>
            </div>
        );

        return (
            <Setting
                label={this.props.label}
                labelClassName={this.props.labelClassName}
                inputClassName={this.props.inputClassName}
                helpText={this.props.helpText}
                inputId={this.props.id}
                maxLength={this.props.maxLength}
            >
                {input}
            </Setting>
        );
    }
}