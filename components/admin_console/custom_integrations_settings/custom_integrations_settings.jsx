// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedHTMLMessage, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import {rolesFromMapping, mappingValueFromRoles} from 'utils/policy_roles_adapter';
import {saveConfig} from 'actions/admin_actions.jsx';

import AdminSettings from '.././admin_settings.jsx';
import BooleanSetting from '.././boolean_setting.jsx';
import SettingsGroup from '.././settings_group.jsx';

import LoadingScreen from 'components/loading_screen.jsx';

export class WebhookSettings extends AdminSettings {
    static propTypes = {
        intl: intlShape.isRequired,
        roles: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            loadRolesIfNeeded: PropTypes.func.isRequired,
            editRole: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            ...this.state, // Brings the state in from the parent class.
            enableOnlyAdminIntegrations: null,
            loaded: false,
            edited: {},
        };
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        this.props.actions.loadRolesIfNeeded(['team_user', 'system_user']);
        if (this.props.roles.system_user &&
            this.props.roles.team_user) {
            this.loadPoliciesIntoState(this.props);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (!this.state.loaded &&
            nextProps.roles.system_user &&
            nextProps.roles.team_user) {
            this.loadPoliciesIntoState(nextProps);
        }
    }

    handleChange = (id, value) => {
        this.setState({
            saveNeeded: true,
            [id]: value,
            edited: {...this.state.edited, [id]: this.props.intl.formatMessage({id: 'admin.field_names.' + id, defaultMessage: id})},
        });

        this.props.setNavigationBlocked(true);
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        this.setState({
            saving: true,
            serverError: null,
        });

        // Purposely converting enableOnlyAdminIntegrations value from boolean to string 'true' or 'false'
        // so that it can be used as a key in the policy roles adapter mapping.
        const updatedRoles = rolesFromMapping({enableOnlyAdminIntegrations: this.state.enableOnlyAdminIntegrations.toString()}, this.props.roles);

        let success = true;

        await Promise.all(Object.values(updatedRoles).map(async (item) => {
            try {
                await this.props.actions.editRole(item);
            } catch (err) {
                success = false;
                this.setState({
                    saving: false,
                    serverError: err.message,
                });
            }
        }));

        if (success) {
            const configFieldEdited = (
                this.state.edited.enableIncomingWebhooks ||
                this.state.edited.enableOutgoingWebhooks ||
                this.state.edited.enableCommands ||
                this.state.edited.enablePostUsernameOverride ||
                this.state.edited.enablePostIconOverride ||
                this.state.edited.enableOAuthServiceProvider ||
                this.state.edited.enableUserAccessTokens
            );
            if (configFieldEdited) {
                this.doSubmit(() => {
                    if (!this.state.serverError) {
                        this.setState({edited: {}});
                    }
                });
            } else {
                this.setState({
                    saving: false,
                    saveNeeded: false,
                    serverError: null,
                    edited: {},
                });
                this.props.setNavigationBlocked(false);
            }
        }
    };

    doSubmit = (callback) => {
        this.setState({
            saving: true,
            serverError: null,
        });

        // clone config so that we aren't modifying data in the stores
        let config = JSON.parse(JSON.stringify(this.props.config));
        config = this.getConfigFromState(config);

        saveConfig(
            config,
            (savedConfig) => {
                this.setState(this.getStateFromConfig(savedConfig));

                this.setState({
                    saveNeeded: false,
                    saving: false,
                });

                this.props.setNavigationBlocked(false);

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            },
            (err) => {
                let errMessage = err.message;
                if (err.id === 'ent.cluster.save_config.error') {
                    errMessage = (
                        <FormattedMessage
                            id='ent.cluster.save_config_with_roles.error'
                            defaultMessage='The following configuration settings cannot be saved when High Availability is enabled and the System Console is in read-only mode: {keys}.'
                            values={{
                                keys: [
                                    this.state.edited.enableIncomingWebhooks,
                                    this.state.edited.enableOutgoingWebhooks,
                                    this.state.edited.enableCommands,
                                    this.state.edited.enablePostUsernameOverride,
                                    this.state.edited.enablePostIconOverride,
                                    this.state.edited.enableOAuthServiceProvider,
                                    this.state.edited.enableUserAccessTokens,
                                ].filter((v) => v).join(', '),
                            }}
                        />
                    );
                }

                this.setState({
                    saving: false,
                    serverError: errMessage,
                });

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            }
        );
    };

    loadPoliciesIntoState(props) {
        const {roles} = props;

        // Purposely parsing boolean from string 'true' or 'false'
        // because the string comes from the policy roles adapter mapping.
        const enableOnlyAdminIntegrations = (mappingValueFromRoles('enableOnlyAdminIntegrations', roles) === 'true');

        this.setState({enableOnlyAdminIntegrations, loaded: true});
    }

    getConfigFromState = (config) => {
        config.ServiceSettings.EnableIncomingWebhooks = this.state.enableIncomingWebhooks;
        config.ServiceSettings.EnableOutgoingWebhooks = this.state.enableOutgoingWebhooks;
        config.ServiceSettings.EnableCommands = this.state.enableCommands;
        config.ServiceSettings.EnablePostUsernameOverride = this.state.enablePostUsernameOverride;
        config.ServiceSettings.EnablePostIconOverride = this.state.enablePostIconOverride;
        config.ServiceSettings.EnableOAuthServiceProvider = this.state.enableOAuthServiceProvider;
        config.ServiceSettings.EnableUserAccessTokens = this.state.enableUserAccessTokens;

        return config;
    };

    getStateFromConfig(config) {
        return {
            enableIncomingWebhooks: config.ServiceSettings.EnableIncomingWebhooks,
            enableOutgoingWebhooks: config.ServiceSettings.EnableOutgoingWebhooks,
            enableCommands: config.ServiceSettings.EnableCommands,
            enablePostUsernameOverride: config.ServiceSettings.EnablePostUsernameOverride,
            enablePostIconOverride: config.ServiceSettings.EnablePostIconOverride,
            enableOAuthServiceProvider: config.ServiceSettings.EnableOAuthServiceProvider,
            enableUserAccessTokens: config.ServiceSettings.EnableUserAccessTokens,
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.integrations.custom'
                defaultMessage='Custom Integrations'
            />
        );
    }

    renderSettings = () => {
        if (!this.state.loaded) {
            return <LoadingScreen/>;
        }
        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enableIncomingWebhooks'
                    label={
                        <FormattedMessage
                            id='admin.service.webhooksTitle'
                            defaultMessage='Enable Incoming Webhooks: '
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.service.webhooksDescription'
                            defaultMessage='When true, incoming webhooks will be allowed. To help combat phishing attacks, all posts from webhooks will be labelled by a BOT tag. See <a href="http://docs.mattermost.com/developer/webhooks-incoming.html" target="_blank">documentation</a> to learn more.'
                        />
                    }
                    value={this.state.enableIncomingWebhooks}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.EnableIncomingWebhooks')}
                />
                <BooleanSetting
                    id='enableOutgoingWebhooks'
                    label={
                        <FormattedMessage
                            id='admin.service.outWebhooksTitle'
                            defaultMessage='Enable Outgoing Webhooks: '
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.service.outWebhooksDesc'
                            defaultMessage='When true, outgoing webhooks will be allowed. See <a href="http://docs.mattermost.com/developer/webhooks-outgoing.html" target="_blank">documentation</a> to learn more.'
                        />
                    }
                    value={this.state.enableOutgoingWebhooks}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.EnableOutgoingWebhooks')}
                />
                <BooleanSetting
                    id='enableCommands'
                    label={
                        <FormattedMessage
                            id='admin.service.cmdsTitle'
                            defaultMessage='Enable Custom Slash Commands: '
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.service.cmdsDesc'
                            defaultMessage='When true, custom slash commands will be allowed. See <a href="http://docs.mattermost.com/developer/slash-commands.html" target="_blank">documentation</a> to learn more.'
                        />
                    }
                    value={this.state.enableCommands}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.EnableCommands')}
                />
                <BooleanSetting
                    id='enableOAuthServiceProvider'
                    label={
                        <FormattedMessage
                            id='admin.oauth.providerTitle'
                            defaultMessage='Enable OAuth 2.0 Service Provider: '
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.oauth.providerDescription'
                            defaultMessage='When true, Mattermost can act as an OAuth 2.0 service provider allowing Mattermost to authorize API requests from external applications. See <a href="https://docs.mattermost.com/developer/oauth-2-0-applications.html" target="_blank">documentation</a> to learn more.'
                        />
                    }
                    value={this.state.enableOAuthServiceProvider}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.EnableOAuthServiceProvider')}
                />
                {this.props.license.IsLicensed === 'false' &&
                    <BooleanSetting
                        id='enableOnlyAdminIntegrations'
                        label={
                            <FormattedMessage
                                id='admin.service.integrationAdmin'
                                defaultMessage='Restrict managing integrations to Admins:'
                            />
                        }
                        helpText={
                            <FormattedMessage
                                id='admin.service.integrationAdminDesc'
                                defaultMessage='When true, webhooks and slash commands can only be created, edited and viewed by Team and System Admins, and OAuth 2.0 applications by System Admins. Integrations are available to all users after they have been created by the Admin.'
                            />
                        }
                        value={this.state.enableOnlyAdminIntegrations}
                        onChange={this.handleChange}
                        setByEnv={false}
                    />}
                <BooleanSetting
                    id='enablePostUsernameOverride'
                    label={
                        <FormattedMessage
                            id='admin.service.overrideTitle'
                            defaultMessage='Enable integrations to override usernames:'
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.service.overrideDescription'
                            defaultMessage='When true, webhooks, slash commands and other integrations, such as <a href="https://docs.mattermost.com/integrations/zapier.html" target="_blank">Zapier</a>, will be allowed to change the username they are posting as. Note: Combined with allowing integrations to override profile picture icons, users may be able to perform phishing attacks by attempting to impersonate other users.'
                        />
                    }
                    value={this.state.enablePostUsernameOverride}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.EnablePostUsernameOverride')}
                />
                <BooleanSetting
                    id='enablePostIconOverride'
                    label={
                        <FormattedMessage
                            id='admin.service.iconTitle'
                            defaultMessage='Enable integrations to override profile picture icons:'
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.service.iconDescription'
                            defaultMessage='When true, webhooks, slash commands and other integrations, such as <a href="https://docs.mattermost.com/integrations/zapier.html" target="_blank">Zapier</a>, will be allowed to change the profile picture they post with. Note: Combined with allowing integrations to override usernames, users may be able to perform phishing attacks by attempting to impersonate other users.'
                        />
                    }
                    value={this.state.enablePostIconOverride}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.EnablePostIconOverride')}
                />
                <BooleanSetting
                    id='enableUserAccessTokens'
                    label={
                        <FormattedMessage
                            id='admin.service.userAccessTokensTitle'
                            defaultMessage='Enable User Access Tokens: '
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.service.userAccessTokensDescription'
                            defaultMessage='When true, users can create <a href="https://about.mattermost.com/default-user-access-tokens" target="_blank">user access tokens</a> for integrations in <strong>Account Settings > Security</strong>. They can be used to authenticate against the API and give full access to the account.<br/><br/>To manage who can create personal access tokens or to search users by token ID, go to the <strong>System Console > Users</strong> page.'
                        />
                    }
                    value={this.state.enableUserAccessTokens}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.EnableUserAccessTokens')}
                />
            </SettingsGroup>
        );
    };
}

export default injectIntl(WebhookSettings);
