// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import AdminSettings from './admin_settings.jsx';
import DropdownSetting from './dropdown_setting.jsx';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

export default class OAuthSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);
        this.getStateFromConfig = this.getStateFromConfig.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.renderOffice365 = this.renderOffice365.bind(this);
        this.renderGoogle = this.renderGoogle.bind(this);
        this.renderGitLab = this.renderGitLab.bind(this);
        this.changeType = this.changeType.bind(this);
    }

    getConfigFromState(config) {
        config.GitLabSettings.Enable = false;
        config.GoogleSettings.Enable = false;
        config.Office365Settings.Enable = false;

        if (this.state.oauthType === Constants.GITLAB_SERVICE) {
            config.GitLabSettings.Enable = true;
            config.GitLabSettings.Id = this.state.id;
            config.GitLabSettings.Secret = this.state.secret;
            config.GitLabSettings.UserApiEndpoint = this.state.userApiEndpoint;
            config.GitLabSettings.AuthEndpoint = this.state.authEndpoint;
            config.GitLabSettings.TokenEndpoint = this.state.tokenEndpoint;
        }

        if (this.state.oauthType === Constants.GOOGLE_SERVICE) {
            config.GoogleSettings.Enable = true;
            config.GoogleSettings.Id = this.state.id;
            config.GoogleSettings.Secret = this.state.secret;
            config.GoogleSettings.UserApiEndpoint = 'https://www.googleapis.com/plus/v1/people/me';
            config.GoogleSettings.AuthEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
            config.GoogleSettings.TokenEndpoint = 'https://www.googleapis.com/oauth2/v4/token';
            config.GoogleSettings.Scope = 'profile email';
        }

        if (this.state.oauthType === Constants.OFFICE365_SERVICE) {
            config.Office365Settings.Enable = true;
            config.Office365Settings.Id = this.state.id;
            config.Office365Settings.Secret = this.state.secret;
            config.Office365Settings.UserApiEndpoint = 'https://graph.microsoft.com/v1.0/me';
            config.Office365Settings.AuthEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
            config.Office365Settings.TokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
            config.Office365Settings.Scope = 'User.Read';
        }

        return config;
    }

    getStateFromConfig(config) {
        this.config = config;

        let oauthType = 'off';
        let settings = {};
        if (config.GitLabSettings.Enable) {
            oauthType = Constants.GITLAB_SERVICE;
            settings = config.GitLabSettings;
        } else if (config.GoogleSettings.Enable) {
            oauthType = Constants.GOOGLE_SERVICE;
            settings = config.GoogleSettings;
        } else if (config.Office365Settings.Enable) {
            oauthType = Constants.OFFICE365_SERVICE;
            settings = config.Office365Settings;
        }

        return {
            oauthType,
            id: settings.Id,
            secret: settings.Secret,
            gitLabUrl: config.GitLabSettings.UserApiEndpoint.replace('/api/v4/user', ''),
            userApiEndpoint: settings.UserApiEndpoint,
            authEndpoint: settings.AuthEndpoint,
            tokenEndpoint: settings.TokenEndpoint,
        };
    }

    changeType(id, value) {
        let settings = {};
        let gitLabUrl = '';
        if (value === Constants.GITLAB_SERVICE) {
            settings = this.config.GitLabSettings;
            gitLabUrl = settings.UserApiEndpoint.replace('/api/v4/user', '');
        } else if (value === Constants.GOOGLE_SERVICE) {
            settings = this.config.GoogleSettings;
        } else if (value === Constants.OFFICE365_SERVICE) {
            settings = this.config.Office365Settings;
        }

        this.setState({
            id: settings.Id,
            secret: settings.Secret,
            gitLabUrl,
            userApiEndpoint: settings.UserApiEndpoint,
            authEndpoint: settings.AuthEndpoint,
            tokenEndpoint: settings.TokenEndpoint,
        });

        this.handleChange(id, value);
    }

    updateGitLabUrl = (id, value) => {
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

    isGitLabURLSetByEnv = () => {
        // Assume that if one of these has been set using an environment variable,
        // all of them have been set that way
        return this.isSetByEnv('GitLabSettings.AuthEndpoint') ||
            this.isSetByEnv('GitLabSettings.TokenEndpoint') ||
            this.isSetByEnv('GitLabSettings.UserApiEndpoint');
    };

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.authentication.oauth'
                defaultMessage='OAuth 2.0'
            />
        );
    }

    renderGoogle() {
        return (
            <div>
                <TextSetting
                    id='id'
                    label={
                        <FormattedMessage
                            id='admin.google.clientIdTitle'
                            defaultMessage='Client ID:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.google.clientIdExample', 'E.g.: "7602141235235-url0fhs1mayfasbmop5qlfns8dh4.apps.googleusercontent.com"')}
                    helpText={
                        <FormattedMessage
                            id='admin.google.clientIdDescription'
                            defaultMessage='The Client ID you received when registering your application with Google.'
                        />
                    }
                    value={this.state.id}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('GoogleSettings.Id')}
                />
                <TextSetting
                    id='secret'
                    label={
                        <FormattedMessage
                            id='admin.google.clientSecretTitle'
                            defaultMessage='Client Secret:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.google.clientSecretExample', 'E.g.: "H8sz0Az-dDs2p15-7QzD231"')}
                    helpText={
                        <FormattedMessage
                            id='admin.google.clientSecretDescription'
                            defaultMessage='The Client Secret you received when registering your application with Google.'
                        />
                    }
                    value={this.state.secret}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('GoogleSettings.Secret')}
                />
                <TextSetting
                    id='userApiEndpoint'
                    label={
                        <FormattedMessage
                            id='admin.google.userTitle'
                            defaultMessage='User API Endpoint:'
                        />
                    }
                    value='https://www.googleapis.com/plus/v1/people/me'
                    disabled={true}
                    setByEnv={false}
                />
                <TextSetting
                    id='authEndpoint'
                    label={
                        <FormattedMessage
                            id='admin.google.authTitle'
                            defaultMessage='Auth Endpoint:'
                        />
                    }
                    value='https://accounts.google.com/o/oauth2/v2/auth'
                    disabled={true}
                    setByEnv={false}
                />
                <TextSetting
                    id='tokenEndpoint'
                    label={
                        <FormattedMessage
                            id='admin.google.tokenTitle'
                            defaultMessage='Token Endpoint:'
                        />
                    }
                    value='https://www.googleapis.com/oauth2/v4/token'
                    disabled={true}
                    setByEnv={false}
                />
            </div>
        );
    }

    renderOffice365() {
        return (
            <div>
                <TextSetting
                    id='id'
                    label={
                        <FormattedMessage
                            id='admin.office365.clientIdTitle'
                            defaultMessage='Application ID:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.office365.clientIdExample', 'E.g.: "adf3sfa2-ag3f-sn4n-ids0-sh1hdax192qq"')}
                    helpText={
                        <FormattedMessage
                            id='admin.office365.clientIdDescription'
                            defaultMessage='The Application/Client ID you received when registering your application with Microsoft.'
                        />
                    }
                    value={this.state.id}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('Office365Settings.Id')}
                />
                <TextSetting
                    id='secret'
                    label={
                        <FormattedMessage
                            id='admin.office365.clientSecretTitle'
                            defaultMessage='Application Secret Password:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.office365.clientSecretExample', 'E.g.: "shAieM47sNBfgl20f8ci294"')}
                    helpText={
                        <FormattedMessage
                            id='admin.office365.clientSecretDescription'
                            defaultMessage='The Application Secret Password you generated when registering your application with Microsoft.'
                        />
                    }
                    value={this.state.secret}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('Office365Settings.Secret')}
                />
                <TextSetting
                    id='userApiEndpoint'
                    label={
                        <FormattedMessage
                            id='admin.office365.userTitle'
                            defaultMessage='User API Endpoint:'
                        />
                    }
                    value='https://graph.microsoft.com/v1.0/me'
                    disabled={true}
                    setByEnv={false}
                />
                <TextSetting
                    id='authEndpoint'
                    label={
                        <FormattedMessage
                            id='admin.office365.authTitle'
                            defaultMessage='Auth Endpoint:'
                        />
                    }
                    value='https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
                    disabled={true}
                    setByEnv={false}
                />
                <TextSetting
                    id='tokenEndpoint'
                    label={
                        <FormattedMessage
                            id='admin.office365.tokenTitle'
                            defaultMessage='Token Endpoint:'
                        />
                    }
                    value='https://login.microsoftonline.com/common/oauth2/v2.0/token'
                    disabled={true}
                    setByEnv={false}
                />
            </div>
        );
    }

    renderGitLab() {
        return (
            <div>
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
                    setByEnv={this.isSetByEnv('GitLabSettings.Id')}
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
                    setByEnv={this.isSetByEnv('GitLabSettings.Secret')}
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
                    setByEnv={this.isGitLabURLSetByEnv()}
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
                    setByEnv={false}
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
                    setByEnv={false}
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
                    setByEnv={false}
                />
            </div>
        );
    }

    renderSettings() {
        let contents;
        let helpText;
        if (this.state.oauthType === Constants.GITLAB_SERVICE) {
            contents = this.renderGitLab();
            helpText = (
                <ol>
                    <li>
                        <FormattedMessage
                            id='admin.gitlab.EnableProcess1'
                            defaultMessage='Log in to your GitLab account and go to Profile Settings -> Applications.'
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id='admin.gitlab.EnableProcess2'
                            defaultMessage='Enter Redirect URIs "<your-mattermost-url>/login/gitlab/complete" (example: http://localhost:8065/login/gitlab/complete) and "<your-mattermost-url>/signup/gitlab/complete".'
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id='admin.gitlab.EnableProcess3'
                            defaultMessage='Then use "Application Secret Key" and "Application ID" fields from GitLab to complete the options below.'
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id='admin.gitlab.EnableProcess4'
                            defaultMessage='Complete the Endpoint URLs below.'
                        />
                    </li>
                </ol>
            );
        } else if (this.state.oauthType === Constants.GOOGLE_SERVICE) {
            contents = this.renderGoogle();
            helpText = (
                <ol>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.google.EnableProcess1'
                            defaultMessage='[Log in](!https://accounts.google.com/login) to your Google account.'
                        />
                    </li>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.google.EnableProcess2'
                            defaultMessage='Go to [https://console.developers.google.com](!https://console.developers.google.com), click **Credentials** in the left hand sidebar and enter "Mattermost - your-company-name" as the **Project Name**, then click **Create**.'
                        />
                    </li>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.google.EnableProcess3'
                            defaultMessage='Click the **OAuth consent screen** header and enter "Mattermost" as the **Product name shown to users**, then click **Save**.'
                        />
                    </li>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.google.EnableProcess4'
                            defaultMessage='Under the **Credentials** header, click **Create credentials**, choose **OAuth client ID** and select **Web Application**.'
                        />
                    </li>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.google.EnableProcess5'
                            defaultMessage='Under **Restrictions** and **Authorized redirect URIs** enter **your-mattermost-url/signup/google/complete** (example: http://localhost:8065/signup/google/complete). Click **Create**.'
                        />
                    </li>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.google.EnableProcess6'
                            defaultMessage='Paste the **Client ID** and **Client Secret** to the fields below, then click **Save**.'
                        />
                    </li>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.google.EnableProcess7'
                            defaultMessage='Finally, go to [Google+ API](!https://console.developers.google.com/apis/api/plus/overview) and click **Enable**. This might take a few minutes to propagate through Google`s systems.'
                        />
                    </li>
                </ol>
            );
        } else if (this.state.oauthType === Constants.OFFICE365_SERVICE) {
            contents = this.renderOffice365();
            helpText = (
                <ol>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.office365.EnableProcess1'
                            defaultMessage='[Log in](!https://login.microsoftonline.com/) to your Microsoft or Office 365 account. Make sure it`s the account on the same [tenant](!https://msdn.microsoft.com/en-us/library/azure/jj573650.aspx#Anchor_0) that you would like users to log in with.'
                        />
                    </li>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.office365.EnableProcess2'
                            defaultMessage='Go to [https://apps.dev.microsoft.com](!https://apps.dev.microsoft.com), click **Go to app list** > **Add an app** and use \"Mattermost - your-company-name\" as the **Application Name**.'
                        />
                    </li>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.office365.EnableProcess3'
                            defaultMessage='Under **Application Secrets**, click **Generate New Password** and paste it to the **Application Secret Password** field below.'
                        />
                    </li>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.office365.EnableProcess4'
                            defaultMessage='Under **Platforms**, click **Add Platform**, choose **Web** and enter **your-mattermost-url/signup/office365/complete** (example: http://localhost:8065/signup/office365/complete) under **Redirect URIs**. Also uncheck **Allow Implicit Flow**.'
                        />
                    </li>
                    <li>
                        <FormattedMarkdownMessage
                            id='admin.office365.EnableProcess5'
                            defaultMessage='Finally, click **Save** and then paste the **Application ID** below.'
                        />
                    </li>
                </ol>
            );
        }

        const oauthTypes = [];
        oauthTypes.push({value: 'off', text: Utils.localizeMessage('admin.oauth.off', 'Do not allow sign-in via an OAuth 2.0 provider.')});
        oauthTypes.push({value: Constants.GITLAB_SERVICE, text: Utils.localizeMessage('admin.oauth.gitlab', 'GitLab')});
        if (this.props.license.IsLicensed === 'true') {
            if (this.props.license.GoogleOAuth === 'true') {
                oauthTypes.push({value: Constants.GOOGLE_SERVICE, text: Utils.localizeMessage('admin.oauth.google', 'Google Apps')});
            }
            if (this.props.license.Office365OAuth === 'true') {
                oauthTypes.push({value: Constants.OFFICE365_SERVICE, text: Utils.localizeMessage('admin.oauth.office365', 'Office 365 (Beta)')});
            }
        }

        return (
            <SettingsGroup>
                <DropdownSetting
                    id='oauthType'
                    values={oauthTypes}
                    label={
                        <FormattedMessage
                            id='admin.oauth.select'
                            defaultMessage='Select OAuth 2.0 Service Provider:'
                        />
                    }
                    helpText={helpText}
                    value={this.state.oauthType}
                    onChange={this.changeType}
                    setByEnv={false}
                />
                {contents}
            </SettingsGroup>
        );
    }
}
