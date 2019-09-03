// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Setting from './setting.jsx';

export default class RadioSetting extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        values: PropTypes.array.isRequired,
        label: PropTypes.node.isRequired,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        labelClassName: PropTypes.string,
        inputClassName: PropTypes.string,
        helpText: PropTypes.node,
    };

    static defaultProps = {
        labelClassName: '',
        inputClassName: '',
    };

    handleChange = (e) => {
        this.props.onChange(this.props.id, e.target.value);
    }

    render() {
        const options = [];
        for (const {value, text} of this.props.values) {
            options.push(
                <div
                    className='radio'
                    key={value}
                >
                    <label>
                        <input
                            type='radio'
                            value={value}
                            name={this.props.id}
                            checked={value === this.props.value}
                            onChange={this.handleChange}
                        />
                        {text}
                    </label>
                </div>
            );
        }

        return (
            <Setting
                label={this.props.label}
                labelClassName={this.props.labelClassName}
                inputClassName={this.props.inputClassName}
                helpText={this.props.helpText}
                inputId={this.props.id}
            >
                {options}
            </Setting>
        );
    }
}
