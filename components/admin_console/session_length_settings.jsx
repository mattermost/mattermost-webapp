// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import * as Utils from 'utils/utils.jsx';

import AdminSettings from './admin_settings';
import BooleanSetting from './boolean_setting';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting';

export default class SessionLengthSettings extends AdminSettings {
    getConfigFromState = (config) => {
        const MINIMUM_IDLE_TIMEOUT = 5;

        config.ServiceSettings.ExtendSessionLengthWithActivity = this.state.extendSessionLengthWithActivity;
        config.ServiceSettings.SessionLengthWebInDays = this.parseIntNonZero(this.state.sessionLengthWebInDays);
        config.ServiceSettings.SessionLengthMobileInDays = this.parseIntNonZero(this.state.sessionLengthMobileInDays);
        config.ServiceSettings.SessionLengthSSOInDays = this.parseIntNonZero(this.state.sessionLengthSSOInDays);
        config.ServiceSettings.SessionCacheInMinutes = this.parseIntNonZero(this.state.sessionCacheInMinutes);
        config.ServiceSettings.SessionIdleTimeoutInMinutes = this.parseIntZeroOrMin(this.state.sessionIdleTimeoutInMinutes, MINIMUM_IDLE_TIMEOUT);

        return config;
    }

    getStateFromConfig(config) {
        return {
            extendSessionLengthWithActivity: config.ServiceSettings.ExtendSessionLengthWithActivity,
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
                id='admin.sessionLengths.title'
                defaultMessage='Session Lengths'
            />
        );
    }

    renderSettings = () => {
        let sessionLengthWebHelpText;
        let sessionLengthMobileHelpText;
        let sessionLengthSSOHelpText;
        let sessionTimeoutSetting;
        if (this.state.extendSessionLengthWithActivity) {
            sessionLengthWebHelpText = (
                <FormattedMessage
                    id='admin.service.webSessionDaysDesc.extendLength'
                    defaultMessage='Set the number of days from the last activity in Mattermost to the expiry of the user’s session when using email and AD/LDAP authentication. After changing this setting, the new session length will take effect after the next time the user enters their credentials.'
                />
            );
            sessionLengthMobileHelpText = (
                <FormattedMessage
                    id='admin.service.mobileSessionDaysDesc.extendLength'
                    defaultMessage='Set the number of days from the last activity in Mattermost to the expiry of the user’s session on mobile. After changing this setting, the new session length will take effect after the next time the user enters their credentials.'
                />
            );
            sessionLengthSSOHelpText = (
                <FormattedMessage
                    id='admin.service.ssoSessionDaysDesc.extendLength'
                    defaultMessage='Set the number of days from the last activity in Mattermost to the expiry of the user’s session for SSO authentication, such as SAML, GitLab and OAuth 2.0. If the authentication method is SAML or GitLab, the user may automatically be logged back in to Mattermost if they are already logged in to SAML or GitLab. After changing this setting, the setting will take effect after the next time the user enters their credentials.'
                />
            );
        } else {
            sessionLengthWebHelpText = (
                <FormattedMessage
                    id='admin.service.webSessionDaysDesc'
                    defaultMessage='The number of days from the last time a user entered their credentials to the expiry of the users session. After changing this setting, the new session length will take effect after the next time the user enters their credentials.'
                />
            );
            sessionLengthMobileHelpText = (
                <FormattedMessage
                    id='admin.service.mobileSessionDaysDesc'
                    defaultMessage='The number of days from the last time a user entered their credentials to the expiry of the users session. After changing this setting, the new session length will take effect after the next time the user enters their credentials.'
                />
            );
            sessionLengthSSOHelpText = (
                <FormattedMessage
                    id='admin.service.ssoSessionDaysDesc'
                    defaultMessage='The number of days from the last time a user entered their credentials to the expiry of the users session. If the authentication method is SAML or GitLab, the user may automatically be logged back in to Mattermost if they are already logged in to SAML or GitLab. After changing this setting, the setting will take effect after the next time the user enters their credentials.'
                />
            );
        }
        if (this.props.license.Compliance && !this.state.extendSessionLengthWithActivity) {
            sessionTimeoutSetting = (
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
                        <FormattedMarkdownMessage
                            id='admin.service.sessionIdleTimeoutDesc'
                            defaultMessage="The number of minutes from the last time a user was active on the system to the expiry of the user\'s session. Once expired, the user will need to log in to continue. Minimum is 5 minutes, and 0 is unlimited.\n \nApplies to the desktop app and browsers. For mobile apps, use an EMM provider to lock the app when not in use. In High Availability mode, enable IP hash load balancing for reliable timeout measurement."
                        />
                    }
                    value={this.state.sessionIdleTimeoutInMinutes}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.SessionIdleTimeoutInMinutes')}
                    disabled={this.props.isDisabled}
                />
            );
        }

        return (
            <SettingsGroup>
                <BooleanSetting
                    id='extendSessionLengthWithActivity'
                    label={
                        <FormattedMessage
                            id='admin.service.extendSessionLengthActivity.label'
                            defaultMessage='Extend session length with activity: '
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.service.extendSessionLengthActivity.helpText'
                            defaultMessage='When true, sessions will be automatically extended when the user is active in their Mattermost client. Users sessions will only expire if they are not active in their Mattermost client for the entire duration of the session lengths defined in the fields below. When false, sessions will not extend with activity in Mattermost. User sessions will immediately expire at the end of the session length or idle timeouts defined below. '
                        />
                    }
                    value={this.state.extendSessionLengthWithActivity}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.ExtendSessionLengthWithActivity')}
                    disabled={this.props.isDisabled}
                />
                <TextSetting
                    id='sessionLengthWebInDays'
                    label={
                        <FormattedMessage
                            id='admin.service.webSessionDays'
                            defaultMessage='Session Length AD/LDAP and Email (days):'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.service.sessionDaysEx', 'E.g.: "30"')}
                    helpText={sessionLengthWebHelpText}
                    value={this.state.sessionLengthWebInDays}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.SessionLengthWebInDays')}
                    disabled={this.props.isDisabled}
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
                    helpText={sessionLengthMobileHelpText}
                    value={this.state.sessionLengthMobileInDays}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.SessionLengthMobileInDays')}
                    disabled={this.props.isDisabled}
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
                    helpText={sessionLengthSSOHelpText}
                    value={this.state.sessionLengthSSOInDays}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.SessionLengthSSOInDays')}
                    disabled={this.props.isDisabled}
                />
                <TextSetting
                    id='sessionCacheInMinutes'
                    label={
                        <FormattedMessage
                            id='admin.service.sessionCache'
                            defaultMessage='Session Cache (minutes):'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.service.sessionMinutesEx', 'E.g.: "10"')}
                    helpText={
                        <FormattedMessage
                            id='admin.service.sessionCacheDesc'
                            defaultMessage='The number of minutes to cache a session in memory:'
                        />
                    }
                    value={this.state.sessionCacheInMinutes}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.SessionCacheInMinutes')}
                    disabled={this.props.isDisabled}
                />
                {sessionTimeoutSetting}
            </SettingsGroup>
        );
    }
}
