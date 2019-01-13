// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import * as React from 'react';

import Setting from './setting.jsx';

type Props = {|
    id: string,
    label: React.Node,
    labelClassName?: string,
    placeholder?: string,
    helpText?: React.Node,
    footer?: React.Node,
    value: string | number,
    inputClassName?: string,
    maxLength?: number,
    resizable?: boolean,
    onChange: (string, string | number) => null,
    disabled?: boolean,
    type: 'input' | 'textarea' | 'number' | 'email' | 'tel' | 'url',
|}

export default class TextSetting extends React.Component<Props> {
    static defaultProps = {
        labelClassName: '',
        inputClassName: '',
        type: 'input',
        maxLength: null,
        resizable: true,
        onChange: () => null,
    };

    handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
        if (this.props.type === 'number') {
            this.props.onChange(this.props.id, parseInt(e.target.value, 10) || 0);
        } else {
            this.props.onChange(this.props.id, e.target.value);
        }
    }

    render() {
        const {resizable} = this.props;
        let {type} = this.props;
        let input = null;

        if (type === 'textarea') {
            const style = {};
            if (!resizable) {
                style.resize = 'none';
            }

            input = (
                <textarea
                    id={this.props.id}
                    style={style}
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
