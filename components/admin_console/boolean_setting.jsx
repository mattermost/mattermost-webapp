// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

import Setting from './setting.jsx';

export default class BooleanSetting extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired,
        value: PropTypes.bool.isRequired,
        onChange: PropTypes.func.isRequired,
        trueText: PropTypes.node,
        falseText: PropTypes.node,
        disabled: PropTypes.bool.isRequired,
        setByEnv: PropTypes.bool.isRequired,
        disabledText: PropTypes.node,
        helpText: PropTypes.node.isRequired,
    };

    static defaultProps = {
        trueText: (
            <FormattedMessage
                id='admin.true'
                defaultMessage='true'
            />
        ),
        falseText: (
            <FormattedMessage
                id='admin.false'
                defaultMessage='false'
            />
        ),
        disabled: false,
    };

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.onChange(this.props.id, e.target.value === 'true');
    }

    render() {
        let helpText;
        if (this.props.disabled && this.props.disabledText) {
            helpText = (
                <div>
                    <span className='admin-console__disabled-text'>
                        {this.props.disabledText}
                    </span>
                    {this.props.helpText}
                </div>
            );
        } else {
            helpText = this.props.helpText;
        }

        return (
            <Setting
                label={this.props.label}
                helpText={helpText}
                setByEnv={this.props.setByEnv}
            >
                <a name={this.props.id}/>
                <label className='radio-inline'>
                    <input
                        type='radio'
                        value='true'
                        id={Utils.createSafeId(this.props.id) + 'true'}
                        name={this.props.id}
                        checked={this.props.value}
                        onChange={this.handleChange}
                        disabled={this.props.disabled || this.props.setByEnv}
                    />
                    {this.props.trueText}
                </label>
                <label className='radio-inline'>
                    <input
                        type='radio'
                        value='false'
                        id={Utils.createSafeId(this.props.id) + 'false'}
                        name={this.props.id}
                        checked={!this.props.value}
                        onChange={this.handleChange}
                        disabled={this.props.disabled || this.props.setByEnv}
                    />
                    {this.props.falseText}
                </label>
            </Setting>
        );
    }
}
