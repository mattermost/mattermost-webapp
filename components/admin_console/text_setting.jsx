// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Setting from './setting.jsx';

export default class TextSetting extends React.Component {
    static get propTypes() {
        return {
            id: PropTypes.string.isRequired,
            label: PropTypes.node.isRequired,
            placeholder: PropTypes.string,
            helpText: PropTypes.node,
            value: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]).isRequired,
            maxLength: PropTypes.number,
            onChange: PropTypes.func,
            disabled: PropTypes.bool,
            type: PropTypes.oneOf([
                'number',
                'input',
                'textarea',
            ]),
        };
    }

    static get defaultProps() {
        return {
            type: 'input',
            maxLength: null,
        };
    }

    handleChange = (e) => {
        if (this.props.type === 'number') {
            this.props.onChange(this.props.id, parseInt(e.target.value, 10));
        } else {
            this.props.onChange(this.props.id, e.target.value);
        }
    }

    render() {
        let input = null;
        if (this.props.type === 'input') {
            input = (
                <input
                    id={this.props.id}
                    className='form-control'
                    type='text'
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    maxLength={this.props.maxLength}
                    onChange={this.handleChange}
                    disabled={this.props.disabled}
                />
            );
        } else if (this.props.type === 'number') {
            input = (
                <input
                    id={this.props.id}
                    className='form-control'
                    type='number'
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    maxLength={this.props.maxLength}
                    onChange={this.handleChange}
                    disabled={this.props.disabled}
                />
            );
        } else if (this.props.type === 'textarea') {
            input = (
                <textarea
                    id={this.props.id}
                    className='form-control'
                    rows='5'
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    maxLength={this.props.maxLength}
                    onChange={this.handleChange}
                    disabled={this.props.disabled}
                />
            );
        }

        return (
            <Setting
                label={this.props.label}
                helpText={this.props.helpText}
                inputId={this.props.id}
            >
                {input}
            </Setting>
        );
    }
}
