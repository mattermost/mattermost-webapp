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
        disabled: PropTypes.bool,
        setByEnv: PropTypes.bool.isRequired,
        helpText: PropTypes.node,
    };

    static defaultProps = {
        disabled: false,
    };

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
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
                            disabled={this.props.disabled || this.props.setByEnv}
                        />
                        {text}
                    </label>
                </div>
            );
        }

        return (
            <Setting
                label={this.props.label}
                inputId={this.props.id}
                helpText={this.props.helpText}
                setByEnv={this.props.setByEnv}
            >
                {options}
            </Setting>
        );
    }
}
