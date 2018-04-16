// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

import AdminSettings from './admin_settings.jsx';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

const MINIMUM_IDLE_TIMEOUT = 5;

export default class SessionSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);

        this.renderSettings = this.renderSettings.bind(this);
    }

    getConfigFromState(config) {
        config.ServiceSettings.SessionLengthWebInDays = this.parseIntNonZero(this.state.sessionLengthWebInDays);
        config.ServiceSettings.SessionLengthMobileInDays = this.parseIntNonZero(this.state.sessionLengthMobileInDays);
        config.ServiceSettings.SessionLengthSSOInDays = this.parseIntNonZero(this.state.sessionLengthSSOInDays);
        config.ServiceSettings.SessionCacheInMinutes = this.parseIntNonZero(this.state.sessionCacheInMinutes);

        const timeout = this.parseInt(this.state.sessionIdleTimeoutInMinutes);
        if (timeout !== 0 && timeout < MINIMUM_IDLE_TIMEOUT) {
            config.ServiceSettings.SessionIdleTimeoutInMinutes = MINIMUM_IDLE_TIMEOUT;
        } else {
            config.ServiceSettings.SessionIdleTimeoutInMinutes = timeout;
        }

        return config;
    }

    getStateFromConfig(config) {
        return {
            sessionLengthWebInDays: config.ServiceSettings.SessionLengthWebInDays,
            sessionLengthMobileInDays: config.ServiceSettings.SessionLengthMobileInDays,
            sessionLengthSSOInDays: config.ServiceSettings.SessionLengthSSOInDays,
            sessionCacheInMinutes: config.ServiceSettings.SessionCacheInMinutes,
            sessionIdleTimeoutInMinutes: config.ServiceSettings.SessionIdleTimeoutInMinutes,
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.security.session'
                defaultMessage='Sessions'
            />
        );
    }

    renderSettings() {
        let idleTimeout;
        if (this.props.license.IsLicensed === 'true' && this.props.license.Compliance === 'true') {
            idleTimeout = (
                <TextSetting
                    id='sessionIdleTimeoutInMinutes'
                    label={
                        <FormattedMessage
                            id='admin.service.sessionIdleTimeout'
                            defaultMessage='Session Idle Timeout (minutes):'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.service.sessionIdleTimeoutEx', 'E.g.: "60"')}
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.service.sessionIdleTimeoutDesc'
                            defaultMessage="The number of minutes from the last time a user was active on the system to the expiry of the user's session. Once expired, the user will need to log in to continue. Minimum is 5 minutes, and 0 is unlimited.<br/><br/>Applies to the desktop app and browsers. For mobile apps, use an EMM provider to lock the app when not in use. In High Availability mode, enable IP hash load balancing for reliable timeout measurement."
                        />
                    }
                    value={this.state.sessionIdleTimeoutInMinutes}
                    onChange={this.handleChange}
                />
            );
        }

        return (
            <SettingsGroup>
                <TextSetting
                    id='sessionLengthWebInDays'
                    label={
                        <FormattedMessage
                            id='admin.service.webSessionDays'
                            defaultMessage='Session Length AD/LDAP and Email (days):'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.service.sessionDaysEx', 'E.g.: "30"')}
                    helpText={
                        <FormattedMessage
                            id='admin.service.webSessionDaysDesc'
                            defaultMessage='The number of days from the last time a user entered their credentials to the expiry of the users session. After changing this setting, the new session length will take effect after the next time the user enters their credentials.'
                        />
                    }
                    value={this.state.sessionLengthWebInDays}
                    onChange={this.handleChange}
                />
                <TextSetting
                    id='sessionLengthMobileInDays'
                    label={
                        <FormattedMessage
                            id='admin.service.mobileSessionDays'
                            defaultMessage='Session Length Mobile (days):'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.service.sessionDaysEx', 'E.g.: "30"')}
                    helpText={
                        <FormattedMessage
                            id='admin.service.mobileSessionDaysDesc'
                            defaultMessage='The number of days from the last time a user entered their credentials to the expiry of the users session. After changing this setting, the new session length will take effect after the next time the user enters their credentials.'
                        />
                    }
                    value={this.state.sessionLengthMobileInDays}
                    onChange={this.handleChange}
                />
                <TextSetting
                    id='sessionLengthSSOInDays'
                    label={
                        <FormattedMessage
                            id='admin.service.ssoSessionDays'
                            defaultMessage='Session Length SSO (days):'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.service.sessionDaysEx', 'E.g.: "30"')}
                    helpText={
                        <FormattedMessage
                            id='admin.service.ssoSessionDaysDesc'
                            defaultMessage='The number of days from the last time a user entered their credentials to the expiry of the users session. If the authentication method is SAML or GitLab, the user may automatically be logged back in to Mattermost if they are already logged in to SAML or GitLab. After changing this setting, the setting will take effect after the next time the user enters their credentials. '
                        />
                    }
                    value={this.state.sessionLengthSSOInDays}
                    onChange={this.handleChange}
                />
                <TextSetting
                    id='sessionCacheInMinutes'
                    label={
                        <FormattedMessage
                            id='admin.service.sessionCache'
                            defaultMessage='Session Cache (minutes):'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.service.sessionDaysEx', 'E.g.: "30"')}
                    helpText={
                        <FormattedMessage
                            id='admin.service.sessionCacheDesc'
                            defaultMessage='The number of minutes to cache a session in memory.'
                        />
                    }
                    value={this.state.sessionCacheInMinutes}
                    onChange={this.handleChange}
                />
                {idleTimeout}
            </SettingsGroup>
        );
    }
}
