// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

export default class GitLabSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.updateGitLabUrl = this.updateGitLabUrl.bind(this);
    }

    getConfigFromState(config) {
        config.GitLabSettings.Enable = this.state.enable;
        config.GitLabSettings.Id = this.state.id;
        config.GitLabSettings.Secret = this.state.secret;
        config.GitLabSettings.UserApiEndpoint = this.state.userApiEndpoint;
        config.GitLabSettings.AuthEndpoint = this.state.authEndpoint;
        config.GitLabSettings.TokenEndpoint = this.state.tokenEndpoint;

        return config;
    }

    getStateFromConfig(config) {
        return {
            enable: config.GitLabSettings.Enable,
            id: config.GitLabSettings.Id,
            secret: config.GitLabSettings.Secret,
            gitLabUrl: config.GitLabSettings.UserApiEndpoint.replace('/api/v4/user', ''),
            userApiEndpoint: config.GitLabSettings.UserApiEndpoint,
            authEndpoint: config.GitLabSettings.AuthEndpoint,
            tokenEndpoint: config.GitLabSettings.TokenEndpoint,
        };
    }

    updateGitLabUrl(id, value) {
        let trimmedValue = value;
        if (value.endsWith('/')) {
            trimmedValue = value.slice(0, -1);
        }

        this.setState({
            saveNeeded: true,
            gitLabUrl: value,
            userApiEndpoint: trimmedValue + '/api/v4/user',
            authEndpoint: trimmedValue + '/oauth/authorize',
            tokenEndpoint: trimmedValue + '/oauth/token',
        });
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.authentication.gitlab'
                defaultMessage='GitLab'
            />
        );
    }

    renderSettings() {
        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enable'
                    label={
                        <FormattedMessage
                            id='admin.gitlab.enableTitle'
                            defaultMessage='Enable authentication with GitLab: '
                        />
                    }
                    helpText={
                        <div>
                            <FormattedMessage
                                id='admin.gitlab.enableDescription'
                                defaultMessage='When true, Mattermost allows team creation and account signup using GitLab OAuth.'
                            />
                            <br/>
                            <FormattedHTMLMessage
                                id='admin.gitlab.EnableHtmlDesc'
                                defaultMessage='<ol><li>Log in to your GitLab account and go to Profile Settings -> Applications.</li><li>Enter Redirect URIs "<your-mattermost-url>/login/gitlab/complete" (example: http://localhost:8065/login/gitlab/complete) and "<your-mattermost-url>/signup/gitlab/complete". </li><li>Then use "Application Secret Key" and "Application ID" fields from GitLab to complete the options below.</li><li>Complete the Endpoint URLs below. </li></ol>'
                            />
                        </div>
                    }
                    value={this.state.enable}
                    onChange={this.handleChange}
                />
                <TextSetting
                    id='id'
                    label={
                        <FormattedMessage
                            id='admin.gitlab.clientIdTitle'
                            defaultMessage='Application ID:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.gitlab.clientIdExample', 'E.g.: "jcuS8PuvcpGhpgHhlcpT1Mx42pnqMxQY"')}
                    helpText={
                        <FormattedMessage
                            id='admin.gitlab.clientIdDescription'
                            defaultMessage='Obtain this value via the instructions above for logging into GitLab'
                        />
                    }
                    value={this.state.id}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='secret'
                    label={
                        <FormattedMessage
                            id='admin.gitlab.clientSecretTitle'
                            defaultMessage='Application Secret Key:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.gitlab.clientSecretExample', 'E.g.: "jcuS8PuvcpGhpgHhlcpT1Mx42pnqMxQY"')}
                    helpText={
                        <FormattedMessage
                            id='admin.gitlab.clientSecretDescription'
                            defaultMessage='Obtain this value via the instructions above for logging into GitLab.'
                        />
                    }
                    value={this.state.secret}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='gitlabUrl'
                    label={
                        <FormattedMessage
                            id='admin.gitlab.siteUrl'
                            defaultMessage='GitLab Site URL:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.gitlab.siteUrlExample', 'E.g.: https://')}
                    helpText={
                        <FormattedMessage
                            id='admin.gitlab.siteUrlDescription'
                            defaultMessage='Enter the URL of your GitLab instance, e.g. https://example.com:3000. If your GitLab instance is not set up with SSL, start the URL with http:// instead of https://.'
                        />
                    }
                    value={this.state.gitLabUrl}
                    onChange={this.updateGitLabUrl}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='userApiEndpoint'
                    label={
                        <FormattedMessage
                            id='admin.gitlab.userTitle'
                            defaultMessage='User API Endpoint:'
                        />
                    }
                    placeholder={''}
                    value={this.state.userApiEndpoint}
                    disabled={true}
                />
                <TextSetting
                    id='authEndpoint'
                    label={
                        <FormattedMessage
                            id='admin.gitlab.authTitle'
                            defaultMessage='Auth Endpoint:'
                        />
                    }
                    placeholder={''}
                    value={this.state.authEndpoint}
                    disabled={true}
                />
                <TextSetting
                    id='tokenEndpoint'
                    label={
                        <FormattedMessage
                            id='admin.gitlab.tokenTitle'
                            defaultMessage='Token Endpoint:'
                        />
                    }
                    placeholder={''}
                    value={this.state.tokenEndpoint}
                    disabled={true}
                />
            </SettingsGroup>
        );
    }
}
