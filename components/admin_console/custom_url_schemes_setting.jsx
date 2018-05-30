// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as Utils from 'utils/utils';

import Setting from './setting';

export default class TextSetting extends React.Component {
    static get propTypes() {
        return {
            id: PropTypes.string.isRequired,
            value: PropTypes.array.isRequired,
            onChange: PropTypes.func,
            disabled: PropTypes.bool,
            setByEnv: PropTypes.bool.isRequired,
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            value: this.arrayToString(props.value),
        };
    }

    stringToArray = (str) => {
        return str.split(',').map((s) => s.trim()).filter(Boolean);
    };

    arrayToString = (arr) => {
        return arr.join(',');
    };

    handleChange = (e) => {
        const valueAsArray = this.stringToArray(e.target.value);

        this.props.onChange(this.props.id, valueAsArray);

        this.setState({
            value: e.target.value,
        });
    };

    render() {
        const label = Utils.localizeMessage('admin.customization.customUrlSchemes', 'Custom URL Schemes:');
        const helpText = Utils.localizeMessage(
            'admin.customization.customUrlSchemesDesc',
            'Allow message text to link if it begins with any of the URL schemes listed here. By default, the following schemes will create links: "http", "https", "ftp", "tel", and "mailto".'
        );
        const placeholder = Utils.localizeMessage('admin.customization.customUrlSchemesPlaceholder', 'E.g.: "git,smtp"');

        return (
            <Setting
                label={label}
                helpText={helpText}
                inputId={this.props.id}
                setByEnv={this.props.setByEnv}
            >
                <input
                    id={this.props.id}
                    className='form-control'
                    type='text'
                    placeholder={placeholder}
                    value={this.state.value}
                    onChange={this.handleChange}
                    disabled={this.props.disabled || this.props.setByEnv}
                />
            </Setting>
        );
    }
}
