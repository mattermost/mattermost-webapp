// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Setting from './setting.jsx';

export default class DropdownSetting extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        values: PropTypes.array.isRequired,
        label: PropTypes.node.isRequired,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        helpText: PropTypes.node,
    }

    static defaultProps = {
        isDisabled: false,
    }

    handleChange = (e) => {
        this.props.onChange(this.props.id, e.target.value);
    }

    render() {
        const options = [];
        for (const {value, text} of this.props.values) {
            options.push(
                <option
                    value={value}
                    key={value}
                >
                    {text}
                </option>
            );
        }

        return (
            <Setting
                label={this.props.label}
                inputId={this.props.id}
                helpText={this.props.helpText}
            >
                <select
                    className='form-control'
                    id={this.props.id}
                    value={this.props.value}
                    onChange={this.handleChange}
                    disabled={this.props.disabled}
                >
                    {options}
                </select>
            </Setting>
        );
    }
}
