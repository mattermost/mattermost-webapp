// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import 'bootstrap';

import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import AnnouncementBar from 'components/announcement_bar';
import SystemNotice from 'components/system_notice';
import {reloadIfServerVersionChanged} from 'actions/global_actions.jsx';
import ClientVersionsSettings from 'components/admin_console/client_versions_settings.jsx';
import ClusterSettings from 'components/admin_console/cluster_settings.jsx';
import ConnectionSettings from 'components/admin_console/connection_settings.jsx';
import CustomBrandSettings from 'components/admin_console/custom_brand_settings.jsx';
import CustomEmojiSettings from 'components/admin_console/custom_emoji_settings.jsx';
import DataRetentionSettings from 'components/admin_console/data_retention_settings.jsx';
import DatabaseSettings from 'components/admin_console/database_settings.jsx';
import ElasticsearchSettings from 'components/admin_console/elasticsearch_settings.jsx';
import EmailSettings from 'components/admin_console/email_settings.jsx';
import ExternalServiceSettings from 'components/admin_console/external_service_settings.jsx';
import GitLabSettings from 'components/admin_console/gitlab_settings.jsx';
import LegalAndSupportSettings from 'components/admin_console/legal_and_support_settings.jsx';
import LinkPreviewsSettings from 'components/admin_console/link_previews_settings.jsx';
import MessageExportSettings from 'components/admin_console/message_export_settings';
import NativeAppLinkSettings from 'components/admin_console/native_app_link_settings.jsx';
import OAuthSettings from 'components/admin_console/oauth_settings.jsx';
import PasswordSettings from 'components/admin_console/password_settings.jsx';
import PluginSettings from 'components/admin_console/plugin_settings.jsx';
import PluginManagement from 'components/admin_console/plugin_management';
import CustomPluginSettings from 'components/admin_console/custom_plugin_settings';
import PolicySettings from 'components/admin_console/policy_settings';
import CustomIntegrationSettings from 'components/admin_console/custom_integrations_settings';
import UsersAndTeamsSettings from 'components/admin_console/users_and_teams_settings';

import SchemaAdminSettings from 'components/admin_console/schema_admin_settings';
import PublicLinkSettings from 'components/admin_console/public_link_settings.jsx';
import PushSettings from 'components/admin_console/push_settings.jsx';
import RateSettings from 'components/admin_console/rate_settings.jsx';
import SamlSettings from 'components/admin_console/saml_settings.jsx';
import SessionSettings from 'components/admin_console/session_settings.jsx';
import SignupSettings from 'components/admin_console/signup_settings.jsx';
import StorageSettings from 'components/admin_console/storage_settings.jsx';
import WebrtcSettings from 'components/admin_console/webrtc_settings.jsx';
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

        /*
         * Object representing the config file
         */
        config: PropTypes.object.isRequired,

        /*
         * Object representing the license
         */
        license: PropTypes.object.isRequired,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,

        /*
         * String whether to show prompt to navigate away
         * from unsaved changes
         */
        showNavigationPrompt: PropTypes.bool.isRequired,

        isCurrentUserSystemAdmin: PropTypes.bool.isRequired,

        actions: PropTypes.shape({

            /*
             * Function to get the config file
             */
            getConfig: PropTypes.func.isRequired,

            /*
             * Function to block navigation when there are unsaved changes
             */
            setNavigationBlocked: PropTypes.func.isRequired,

            /*
             * Function to confirm navigation
             */
            confirmNavigation: PropTypes.func.isRequired,

            /*
             * Function to cancel navigation away from unsaved changes
             */
            cancelNavigation: PropTypes.func.isRequired,
        }).isRequired,
    }

    componentWillMount() {
        this.props.actions.getConfig();
        reloadIfServerVersionChanged();
    }

    render() {
        const {license, config, showNavigationPrompt} = this.props;
        const {setNavigationBlocked, cancelNavigation, confirmNavigation} = this.props.actions;

        if (!this.props.isCurrentUserSystemAdmin) {
            return (
                <Redirect to='/'/>
            );
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
        const extraProps = {license, config, setNavigationBlocked};
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
                                        component={UsersAndTeamsSettings}
                                        extraProps={extraProps}
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
                                        path={`${props.match.url}/policy`}
                                        component={PolicySettings}
                                        extraProps={extraProps}
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
                                        component={GitLabSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/oauth`}
                                        component={OAuthSettings}
                                        extraProps={extraProps}
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
                                        component={SamlSettings}
                                        extraProps={extraProps}
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
                                        component={SignupSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/password`}
                                        component={PasswordSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/public_links`}
                                        component={PublicLinkSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/sessions`}
                                        component={SessionSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/connections`}
                                        component={ConnectionSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/client_versions`}
                                        component={ClientVersionsSettings}
                                        extraProps={extraProps}
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
                                        component={CustomIntegrationSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/external`}
                                        component={ExternalServiceSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/webrtc`}
                                        component={WebrtcSettings}
                                        extraProps={extraProps}
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
                                        component={PluginSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/management`}
                                        component={PluginManagement}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/custom/:plugin_id`}
                                        component={CustomPluginSettings}
                                        extraProps={extraProps}
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
                                        component={StorageSettings}
                                        extraProps={extraProps}
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
                                        component={CustomBrandSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/emoji`}
                                        component={CustomEmojiSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/link_previews`}
                                        component={LinkPreviewsSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/legal_and_support`}
                                        component={LegalAndSupportSettings}
                                        extraProps={extraProps}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/native_app_links`}
                                        component={NativeAppLinkSettings}
                                        extraProps={extraProps}
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
                                        component={RateSettings}
                                        extraProps={extraProps}
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
