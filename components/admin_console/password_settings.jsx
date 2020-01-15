// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';

import AdminSettings from './admin_settings';
import Setting from './setting';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting';

export default class PasswordSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.state = Object.assign(this.state, {
            passwordMinimumLength: props.config.PasswordSettings.MinimumLength,
            passwordLowercase: props.config.PasswordSettings.Lowercase,
            passwordNumber: props.config.PasswordSettings.Number,
            passwordUppercase: props.config.PasswordSettings.Uppercase,
            passwordSymbol: props.config.PasswordSettings.Symbol,
            maximumLoginAttempts: props.config.ServiceSettings.MaximumLoginAttempts,
        });

        // Update sample message from config settings
        t('user.settings.security.passwordErrorLowercase');
        t('user.settings.security.passwordErrorLowercaseUppercase');
        t('user.settings.security.passwordErrorLowercaseUppercaseNumber');
        t('user.settings.security.passwordErrorLowercaseUppercaseNumberSymbol');
        t('user.settings.security.passwordErrorLowercaseUppercaseSymbol');
        t('user.settings.security.passwordErrorLowercaseNumber');
        t('user.settings.security.passwordErrorLowercaseNumberSymbol');
        t('user.settings.security.passwordErrorLowercaseSymbol');
        t('user.settings.security.passwordErrorUppercase');
        t('user.settings.security.passwordErrorUppercaseNumber');
        t('user.settings.security.passwordErrorUppercaseNumberSymbol');
        t('user.settings.security.passwordErrorUppercaseSymbol');
        t('user.settings.security.passwordErrorNumber');
        t('user.settings.security.passwordErrorNumberSymbol');
        t('user.settings.security.passwordErrorSymbol');

        let sampleErrorMsgId = 'user.settings.security.passwordError';
        if (props.config.PasswordSettings.Lowercase) {
            sampleErrorMsgId += 'Lowercase';
        }
        if (props.config.PasswordSettings.Uppercase) {
            sampleErrorMsgId += 'Uppercase';
        }
        if (props.config.PasswordSettings.Number) {
            sampleErrorMsgId += 'Number';
        }
        if (props.config.PasswordSettings.Symbol) {
            sampleErrorMsgId += 'Symbol';
        }
        this.sampleErrorMsg = (
            <FormattedMessage
                id={sampleErrorMsgId}
                default='Your password must contain between {min} and {max} characters.'
                values={{
                    min: (this.state.passwordMinimumLength || Constants.MIN_PASSWORD_LENGTH),
                    max: Constants.MAX_PASSWORD_LENGTH,
                }}
            />
        );
    }

    getConfigFromState = (config) => {
        config.PasswordSettings.MinimumLength = this.parseIntNonZero(this.state.passwordMinimumLength, Constants.MIN_PASSWORD_LENGTH);
        config.PasswordSettings.Lowercase = this.refs.lowercase.checked;
        config.PasswordSettings.Uppercase = this.refs.uppercase.checked;
        config.PasswordSettings.Number = this.refs.number.checked;
        config.PasswordSettings.Symbol = this.refs.symbol.checked;

        config.ServiceSettings.MaximumLoginAttempts = this.parseIntNonZero(this.state.maximumLoginAttempts);

        return config;
    }

    getStateFromConfig(config) {
        return {
            passwordMinimumLength: config.PasswordSettings.MinimumLength,
            passwordLowercase: config.PasswordSettings.Lowercase,
            passwordNumber: config.PasswordSettings.Number,
            passwordUppercase: config.PasswordSettings.Uppercase,
            passwordSymbol: config.PasswordSettings.Symbol,
            maximumLoginAttempts: config.ServiceSettings.MaximumLoginAttempts,
        };
    }

    getSampleErrorMsg = (minLength) => {
        if (this.props.config.PasswordSettings.MinimumLength > Constants.MAX_PASSWORD_LENGTH || this.props.config.PasswordSettings.MinimumLength < Constants.MIN_PASSWORD_LENGTH) {
            return (
                <FormattedMessage
                    id='user.settings.security.passwordMinLength'
                    default='Invalid minimum length, cannot show preview.'
                />
            );
        }
        let sampleErrorMsgId = 'user.settings.security.passwordError';
        if (this.refs.lowercase.checked) {
            sampleErrorMsgId += 'Lowercase';
        }
        if (this.refs.uppercase.checked) {
            sampleErrorMsgId += 'Uppercase';
        }
        if (this.refs.number.checked) {
            sampleErrorMsgId += 'Number';
        }
        if (this.refs.symbol.checked) {
            sampleErrorMsgId += 'Symbol';
        }
        return (
            <FormattedMessage
                id={sampleErrorMsgId}
                default='Your password must contain between {min} and {max} characters.'
                values={{
                    min: (minLength || Constants.MIN_PASSWORD_LENGTH),
                    max: Constants.MAX_PASSWORD_LENGTH,
                }}
            />
        );
    }

    handlePasswordLengthChange = (id, value) => {
        this.sampleErrorMsg = this.getSampleErrorMsg(value);
        this.handleChange(id, value);
    }

    handleCheckboxChange = (id, value) => {
        this.sampleErrorMsg = this.getSampleErrorMsg(this.state.passwordMinimumLength);
        this.handleChange(id, value);
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.security.password'
                defaultMessage='Password'
            />
        );
    }

    renderSettings = () => {
        return (
            <SettingsGroup>
                <div>
                    <TextSetting
                        id='passwordMinimumLength'
                        label={
                            <FormattedMessage
                                id='admin.password.minimumLength'
                                defaultMessage='Minimum Password Length:'
                            />
                        }
                        placeholder={Utils.localizeMessage('admin.password.minimumLengthExample', 'E.g.: "5"')}
                        helpText={
                            <FormattedMessage
                                id='admin.password.minimumLengthDescription'
                                defaultMessage='Minimum number of characters required for a valid password. Must be a whole number greater than or equal to {min} and less than or equal to {max}.'
                                values={{
                                    min: Constants.MIN_PASSWORD_LENGTH,
                                    max: Constants.MAX_PASSWORD_LENGTH,
                                }}
                            />
                        }
                        value={this.state.passwordMinimumLength}
                        onChange={this.handlePasswordLengthChange}
                        setByEnv={this.isSetByEnv('PasswordSettings.MinimumLength')}
                    />
                    <Setting
                        label={
                            <FormattedMessage
                                id='passwordRequirements'
                                defaultMessage='Password Requirements:'
                            />
                        }
                    >
                        <div>
                            <label className='checkbox-inline'>
                                <input
                                    type='checkbox'
                                    ref='lowercase'
                                    defaultChecked={this.state.passwordLowercase}
                                    name='admin.password.lowercase'
                                    onChange={this.handleCheckboxChange}
                                />
                                <FormattedMessage
                                    id='admin.password.lowercase'
                                    defaultMessage='At least one lowercase letter'
                                />
                            </label>
                        </div>
                        <div>
                            <label className='checkbox-inline'>
                                <input
                                    type='checkbox'
                                    ref='uppercase'
                                    defaultChecked={this.state.passwordUppercase}
                                    name='admin.password.uppercase'
                                    onChange={this.handleCheckboxChange}
                                />
                                <FormattedMessage
                                    id='admin.password.uppercase'
                                    defaultMessage='At least one uppercase letter'
                                />
                            </label>
                        </div>
                        <div>
                            <label className='checkbox-inline'>
                                <input
                                    type='checkbox'
                                    ref='number'
                                    defaultChecked={this.state.passwordNumber}
                                    name='admin.password.number'
                                    onChange={this.handleCheckboxChange}
                                />
                                <FormattedMessage
                                    id='admin.password.number'
                                    defaultMessage='At least one number'
                                />
                            </label>
                        </div>
                        <div>
                            <label className='checkbox-inline'>
                                <input
                                    type='checkbox'
                                    ref='symbol'
                                    defaultChecked={this.state.passwordSymbol}
                                    name='admin.password.symbol'
                                    onChange={this.handleCheckboxChange}
                                />
                                <FormattedMessage
                                    id='admin.password.symbol'
                                    defaultMessage='At least one symbol (e.g. "~!@#$%^&*()")'
                                />
                            </label>
                        </div>
                        <div>
                            <br/>
                            <label>
                                <FormattedMessage
                                    id='admin.password.preview'
                                    defaultMessage='Error message preview:'
                                />
                            </label>
                            <br/>
                            {this.sampleErrorMsg}
                        </div>
                    </Setting>
                </div>
                <TextSetting
                    id='maximumLoginAttempts'
                    label={
                        <FormattedMessage
                            id='admin.service.attemptTitle'
                            defaultMessage='Maximum Login Attempts:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.service.attemptExample', 'E.g.: "10"')}
                    helpText={
                        <FormattedMessage
                            id='admin.service.attemptDescription'
                            defaultMessage='Login attempts allowed before user is locked out and required to reset password via email.'
                        />
                    }
                    value={this.state.maximumLoginAttempts}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.MaximumLoginAttempts')}
                />
            </SettingsGroup>
        );
    }
}
