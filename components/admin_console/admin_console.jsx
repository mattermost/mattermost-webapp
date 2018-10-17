// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import 'bootstrap';

import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import AnnouncementBar from 'components/announcement_bar';
import SystemNotice from 'components/system_notice';
import {reloadIfServerVersionChanged} from 'actions/global_actions.jsx';
import ClusterSettings from 'components/admin_console/cluster_settings.jsx';
import DataRetentionSettings from 'components/admin_console/data_retention_settings.jsx';
import DatabaseSettings from 'components/admin_console/database_settings.jsx';
import ElasticsearchSettings from 'components/admin_console/elasticsearch_settings.jsx';
import EmailSettings from 'components/admin_console/email_settings.jsx';
import MessageExportSettings from 'components/admin_console/message_export_settings';
import PasswordSettings from 'components/admin_console/password_settings.jsx';

import SchemaAdminSettings from 'components/admin_console/schema_admin_settings';
import PushSettings from 'components/admin_console/push_settings.jsx';
import DiscardChangesModal from 'components/discard_changes_modal.jsx';

import AdminSidebar from './admin_sidebar';
import AdminDefinition from './admin_definition';

const SCRoute = ({component: Component, extraProps, ...rest}) => ( //eslint-disable-line react/prop-types
    <Route
        {...rest}
        render={(props) => (
            <Component
                {...extraProps}
                {...props}
            />
        )}
    />
);

export default class AdminConsole extends React.Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
        environmentConfig: PropTypes.object,
        license: PropTypes.object.isRequired,
        roles: PropTypes.object.isRequired,
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,
        showNavigationPrompt: PropTypes.bool.isRequired,
        isCurrentUserSystemAdmin: PropTypes.bool.isRequired,

        actions: PropTypes.shape({
            getConfig: PropTypes.func.isRequired,
            getEnvironmentConfig: PropTypes.func.isRequired,
            setNavigationBlocked: PropTypes.func.isRequired,
            confirmNavigation: PropTypes.func.isRequired,
            cancelNavigation: PropTypes.func.isRequired,
            loadRolesIfNeeded: PropTypes.func.isRequired,
            editRole: PropTypes.func.isRequired,
        }).isRequired,
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        this.props.actions.getConfig();
        this.props.actions.getEnvironmentConfig();
        this.props.actions.loadRolesIfNeeded(['channel_user', 'team_user', 'system_user', 'channel_admin', 'team_admin', 'system_admin']);
        reloadIfServerVersionChanged();
    }

    mainRolesLoaded(roles) {
        return (
            roles &&
            roles.channel_admin &&
            roles.channel_user &&
            roles.team_admin &&
            roles.team_user &&
            roles.system_admin &&
            roles.system_user
        );
    }

    render() {
        const {
            license,
            config,
            environmentConfig,
            showNavigationPrompt,
        } = this.props;
        const {setNavigationBlocked, cancelNavigation, confirmNavigation} = this.props.actions;

        if (!this.props.isCurrentUserSystemAdmin) {
            return (
                <Redirect to='/'/>
            );
        }

        if (!this.mainRolesLoaded(this.props.roles)) {
            return null;
        }

        if (Object.keys(config).length === 0) {
            return <div/>;
        }
        if (config && Object.keys(config).length === 0 && config.constructor === 'Object') {
            return (
                <div className='admin-console__wrapper'>
                    <AnnouncementBar/>
                    <div className='admin-console'/>
                </div>
            );
        }

        const discardChangesModal = (
            <DiscardChangesModal
                show={showNavigationPrompt}
                onConfirm={confirmNavigation}
                onCancel={cancelNavigation}
            />
        );

        // not every page in the system console will need the license and config, but the vast majority will
        const extraProps = {
            license,
            config,
            environmentConfig,
            setNavigationBlocked,
        };

        return (
            <div className='admin-console__wrapper'>
                <AnnouncementBar/>
                <SystemNotice/>
                <AdminSidebar/>
                <div className='admin-console'>
                    <Switch>
                        <SCRoute
                            path={`${this.props.match.url}/system_analytics`}
                            component={SchemaAdminSettings}
                            extraProps={{
                                ...extraProps,
                                schema: AdminDefinition.reporting.system_analytics.schema,
                            }}
                        />
                        <Route
                            path={`${this.props.match.url}/general`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/configuration`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.general.configuration.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/localization`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.general.localization.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/users_and_teams`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            roles: this.props.roles,
                                            editRole: this.props.actions.editRole,
                                            schema: AdminDefinition.settings.general.users_and_teams.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/privacy`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.general.privacy.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/compliance`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.general.compliance.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/logging`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.general.logging.schema,
                                        }}
                                    />
                                    <Redirect to={`${props.match.url}/configuration`}/>
                                </Switch>
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/permissions`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/schemes`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.permissions.schemes.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/system-scheme`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.permissions.systemScheme.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/team-override-scheme/:scheme_id`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.permissions.teamScheme.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/team-override-scheme`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.permissions.teamScheme.schema,
                                        }}
                                    />
                                </Switch>
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/authentication`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/authentication_email`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.authentication.email.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/gitlab`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.authentication.gitlab.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/oauth`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.authentication.oauth.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/ldap`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.authentication.ldap.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/saml`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.authentication.saml.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/mfa`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.authentication.mfa.schema,
                                        }}
                                    />
                                    <Redirect to={`${props.match.url}/authentication_email`}/>
                                </Switch>
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/security`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/sign_up`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.security.signup.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/password`}
                                        component={PasswordSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/public_links`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.security.public_links.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/sessions`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.security.sessions.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/connections`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.security.connections.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/client_versions`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.security.clientVersions.schema,
                                        }}
                                    />
                                    <Redirect to={`${props.match.url}/sign_up`}/>
                                </Switch>
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/notifications`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/notifications_email`}
                                        component={EmailSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/push`}
                                        component={PushSettings}
                                        extraProps={extraProps}
                                    />
                                    <Redirect to={`${props.match.url}/notifications_email`}/>
                                </Switch>
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/integrations`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/custom`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            roles: this.props.roles,
                                            editRole: this.props.actions.editRole,
                                            schema: AdminDefinition.settings.integrations.custom_integrations.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/external`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.integrations.external.schema,
                                        }}
                                    />
                                    <Redirect to={`${props.match.url}/custom`}/>
                                </Switch>
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/plugins`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/configuration`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.plugins.configuration.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/management`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.plugins.management.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/custom/:plugin_id`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.plugins.custom.schema,
                                        }}
                                    />
                                    <Redirect to={`${props.match.url}/configuration`}/>
                                </Switch>
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/files`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/storage`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.files.storage.schema,
                                        }}
                                    />
                                    <Redirect to={`${props.match.url}/storage`}/>
                                </Switch>
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/customization`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/custom_brand`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.customization.customBrand.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/announcement`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.customization.announcement.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/emoji`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.customization.emoji.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/gif`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.customization.gif.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/posts`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.customization.posts.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/legal_and_support`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.customization.legal_and_support.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/native_app_links`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.customization.native_app_links.schema,
                                        }}
                                    />
                                    <Redirect to={`${props.match.url}/custom_brand`}/>
                                </Switch>
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/compliance`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/data_retention`}
                                        component={DataRetentionSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/message_export`}
                                        component={MessageExportSettings}
                                        extraProps={extraProps}
                                    />
                                    <Redirect to={`${props.match.url}/data_retention`}/>
                                </Switch>
                            )}
                        />
                        <Route
                            path={`${this.props.match.url}/advanced`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/rate`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.advanced.rate.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/database`}
                                        component={DatabaseSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/elasticsearch`}
                                        component={ElasticsearchSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/developer`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.advanced.developer.schema,
                                        }}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/cluster`}
                                        component={ClusterSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/metrics`}
                                        component={SchemaAdminSettings}
                                        extraProps={{
                                            ...extraProps,
                                            schema: AdminDefinition.settings.advanced.metrics.schema,
                                        }}
                                    />
                                    <Redirect to={`${props.match.url}/rate`}/>
                                </Switch>
                            )}
                        />
                        <SCRoute
                            path={`${this.props.match.url}/users`}
                            component={SchemaAdminSettings}
                            extraProps={{
                                ...extraProps,
                                schema: AdminDefinition.reporting.system_users.schema,
                            }}
                        />
                        <SCRoute
                            path={`${this.props.match.url}/team_analytics`}
                            component={SchemaAdminSettings}
                            extraProps={{
                                ...extraProps,
                                schema: AdminDefinition.reporting.team_analytics.schema,
                            }}
                        />
                        <SCRoute
                            path={`${this.props.match.url}/license`}
                            component={SchemaAdminSettings}
                            extraProps={{
                                ...extraProps,
                                schema: AdminDefinition.other.license.schema,
                            }}
                        />
                        <SCRoute
                            path={`${this.props.match.url}/audits`}
                            component={SchemaAdminSettings}
                            extraProps={{
                                ...extraProps,
                                schema: AdminDefinition.other.audits.schema,
                            }}
                        />
                        <SCRoute
                            path={`${this.props.match.url}/logs`}
                            component={SchemaAdminSettings}
                            extraProps={{
                                ...extraProps,
                                schema: AdminDefinition.reporting.server_logs.schema,
                            }}
                        />
                        <Redirect to={`${this.props.match.url}/system_analytics`}/>
                    </Switch>
                </div>
                {discardChangesModal}
            </div>
        );
    }
}
