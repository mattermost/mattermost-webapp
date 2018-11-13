// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Setting from './setting.jsx';

export default class TextSetting extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired,
        labelClassName: PropTypes.string,
        placeholder: PropTypes.string,
        helpText: PropTypes.node,
        footer: PropTypes.node,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]).isRequired,
        inputClassName: PropTypes.string,
        maxLength: PropTypes.number,
        onChange: PropTypes.func,
        disabled: PropTypes.bool,
        type: PropTypes.oneOf([
            'input',
            'textarea',
            'number',
            'email',
            'tel',
            'url',
        ]),
    };

    static defaultProps = {
        labelClassName: '',
        inputClassName: '',
        type: 'input',
        maxLength: null,
    };

    handleChange = (e) => {
        if (this.props.type === 'number') {
            this.props.onChange(this.props.id, parseInt(e.target.value, 10));
        } else {
            this.props.onChange(this.props.id, e.target.value);
        }
    }

    render() {
        let {type} = this.props;
        let input = null;

        if (type === 'textarea') {
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
        } else {
            type = ['input', 'email', 'tel', 'number', 'url'].includes(type) ? type : 'input';

            input = (
                <input
                    id={this.props.id}
                    className='form-control'
                    type={type}
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
                labelClassName={this.props.labelClassName}
                inputClassName={this.props.inputClassName}
                helpText={this.props.helpText}
                inputId={this.props.id}
                footer={this.props.footer}
            >
                {input}
            </Setting>
        );
    }
}
