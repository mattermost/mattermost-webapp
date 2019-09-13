// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Setting from './setting.jsx';

export default class RadioSetting extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(PropTypes.shape({
            text: PropTypes.string,
            value: PropTypes.string,
        })),
        label: PropTypes.node.isRequired,
        onChange: PropTypes.func.isRequired,
        value: PropTypes.string,
        labelClassName: PropTypes.string,
        inputClassName: PropTypes.string,
        helpText: PropTypes.node,
    };

    static defaultProps = {
        labelClassName: '',
        inputClassName: '',
        options: [],
    };

    handleChange = (e) => {
        this.props.onChange(this.props.id, e.target.value);
    }

    render() {
        return (
            <Setting
                label={this.props.label}
                labelClassName={this.props.labelClassName}
                inputClassName={this.props.inputClassName}
                helpText={this.props.helpText}
                inputId={this.props.id}
            >
                {
                    this.props.options.map(({value, text}) => {
                        return (
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
                    })
                }
            </Setting>
        );
    }
}
