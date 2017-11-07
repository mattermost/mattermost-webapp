// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {IndexRedirect, Redirect, Route} from 'react-router/es6';

import JIRASettings from 'plugins/jira/components/settings.jsx';
import * as RouteUtils from 'routes/route_utils.jsx';

import Audits from 'components/admin_console/audits';
import ClientVersionsSettings from 'components/admin_console/client_versions_settings.jsx';
import ClusterSettings from 'components/admin_console/cluster_settings.jsx';
import ComplianceSettings from 'components/admin_console/compliance_settings.jsx';
import ConfigurationSettings from 'components/admin_console/configuration_settings.jsx';
import ConnectionSettings from 'components/admin_console/connection_settings.jsx';
import CustomBrandSettings from 'components/admin_console/custom_brand_settings.jsx';
import CustomEmojiSettings from 'components/admin_console/custom_emoji_settings.jsx';
import CustomIntegrationsSettings from 'components/admin_console/custom_integrations_settings.jsx';
import DataRetentionSettings from 'components/admin_console/data_retention_settings.jsx';
import DatabaseSettings from 'components/admin_console/database_settings.jsx';
import DeveloperSettings from 'components/admin_console/developer_settings.jsx';
import ElasticsearchSettings from 'components/admin_console/elasticsearch_settings.jsx';
import EmailAuthenticationSettings from 'components/admin_console/email_authentication_settings.jsx';
import EmailSettings from 'components/admin_console/email_settings.jsx';
import ExternalServiceSettings from 'components/admin_console/external_service_settings.jsx';
import GitLabSettings from 'components/admin_console/gitlab_settings.jsx';
import LdapSettings from 'components/admin_console/ldap_settings.jsx';
import LegalAndSupportSettings from 'components/admin_console/legal_and_support_settings.jsx';
import LicenseSettings from 'components/admin_console/license_settings.jsx';
import LinkPreviewsSettings from 'components/admin_console/link_previews_settings.jsx';
import LocalizationSettings from 'components/admin_console/localization_settings.jsx';
import LogSettings from 'components/admin_console/log_settings.jsx';
import MetricsSettings from 'components/admin_console/metrics_settings.jsx';
import MfaSettings from 'components/admin_console/mfa_settings.jsx';
import NativeAppLinkSettings from 'components/admin_console/native_app_link_settings.jsx';
import OAuthSettings from 'components/admin_console/oauth_settings.jsx';
import PasswordSettings from 'components/admin_console/password_settings.jsx';
import PluginSettings from 'components/admin_console/plugin_settings.jsx';
import PluginManagement from 'components/admin_console/plugin_management';
import PolicySettings from 'components/admin_console/policy_settings.jsx';
import PrivacySettings from 'components/admin_console/privacy_settings.jsx';
import PublicLinkSettings from 'components/admin_console/public_link_settings.jsx';
import PushSettings from 'components/admin_console/push_settings.jsx';
import RateSettings from 'components/admin_console/rate_settings.jsx';
import SamlSettings from 'components/admin_console/saml_settings.jsx';
import Logs from 'components/admin_console/server_logs';
import SessionSettings from 'components/admin_console/session_settings.jsx';
import SignupSettings from 'components/admin_console/signup_settings.jsx';
import StorageSettings from 'components/admin_console/storage_settings.jsx';
import SystemUsers from 'components/admin_console/system_users';
import UsersAndTeamsSettings from 'components/admin_console/users_and_teams_settings.jsx';
import WebrtcSettings from 'components/admin_console/webrtc_settings.jsx';
import SystemAnalytics from 'components/analytics/system_analytics.jsx';
import TeamAnalytics from 'components/analytics/team_analytics';

export default (
    <Route>
        <Route
            path='system_analytics'
            component={SystemAnalytics}
        />
        <Route path='general'>
            <IndexRedirect to='configuration'/>
            <Route
                path='configuration'
                component={ConfigurationSettings}
            />
            <Route
                path='localization'
                component={LocalizationSettings}
            />
            <Route
                path='users_and_teams'
                component={UsersAndTeamsSettings}
            />
            <Route
                path='privacy'
                component={PrivacySettings}
            />
            <Route
                path='policy'
                component={PolicySettings}
            />
            <Route
                path='compliance'
                component={ComplianceSettings}
            />
            <Route
                path='logging'
                component={LogSettings}
            />
        </Route>
        <Route path='authentication'>
            <IndexRedirect to='authentication_email'/>
            <Route
                path='authentication_email'
                component={EmailAuthenticationSettings}
            />
            <Route
                path='gitlab'
                component={GitLabSettings}
            />
            <Route
                path='oauth'
                component={OAuthSettings}
            />
            <Route
                path='ldap'
                component={LdapSettings}
            />
            <Route
                path='saml'
                component={SamlSettings}
            />
            <Route
                path='mfa'
                component={MfaSettings}
            />
        </Route>
        <Route path='security'>
            <IndexRedirect to='sign_up'/>
            <Route
                path='sign_up'
                component={SignupSettings}
            />
            <Route
                path='password'
                component={PasswordSettings}
            />
            <Route
                path='public_links'
                component={PublicLinkSettings}
            />
            <Route
                path='sessions'
                component={SessionSettings}
            />
            <Route
                path='connections'
                component={ConnectionSettings}
            />
            <Route
                path='client_versions'
                component={ClientVersionsSettings}
            />
        </Route>
        <Route path='notifications'>
            <IndexRedirect to='notifications_email'/>
            <Route
                path='notifications_email'
                component={EmailSettings}
            />
            <Route
                path='push'
                component={PushSettings}
            />
        </Route>
        <Route path='integrations'>
            <IndexRedirect to='custom'/>
            <Route
                path='custom'
                component={CustomIntegrationsSettings}
            />
            <Route
                path='external'
                component={ExternalServiceSettings}
            />
            <Route
                path='webrtc'
                component={WebrtcSettings}
            />
        </Route>
        <Route path='plugins'>
            <Route
                path='configuration'
                component={PluginSettings}
            />
            <Route
                path='management'
                component={PluginManagement}
            />
            <Route
                path='jira'
                component={JIRASettings}
            />
        </Route>
        <Route path='files'>
            <IndexRedirect to='storage'/>
            <Route
                path='storage'
                component={StorageSettings}
            />
        </Route>
        <Route path='customization'>
            <IndexRedirect to='custom_brand'/>
            <Route
                path='custom_brand'
                component={CustomBrandSettings}
            />
            <Route
                path='emoji'
                component={CustomEmojiSettings}
            />
            <Route
                path='link_previews'
                component={LinkPreviewsSettings}
            />
            <Route
                path='legal_and_support'
                component={LegalAndSupportSettings}
            />
            <Route
                path='native_app_links'
                component={NativeAppLinkSettings}
            />
        </Route>
        <Route path='advanced'>
            <IndexRedirect to='rate'/>
            <Route
                path='rate'
                component={RateSettings}
            />
            <Route
                path='database'
                component={DatabaseSettings}
            />
            <Route
                path='dataretention'
                component={DataRetentionSettings}
            />
            <Route
                path='elasticsearch'
                component={ElasticsearchSettings}
            />
            <Route
                path='developer'
                component={DeveloperSettings}
            />
            <Route
                path='cluster'
                component={ClusterSettings}
            />
            <Route
                path='metrics'
                component={MetricsSettings}
            />
        </Route>
        <Route
            path='users'
            component={SystemUsers}
        />
        <Route
            path='team_analytics'
            component={TeamAnalytics}
        />
        <Route path='team'>
            <Redirect
                from=':team'
                to='../users'
            />
            <Redirect
                from=':team/users'
                to='../users'
            />
            <Redirect
                from=':team/analytics'
                to='../team_analytics'
            />
            <Redirect
                from='*'
                to='/error'
                query={RouteUtils.notFoundParams}
            />
        </Route>
        <Route
            path='license'
            component={LicenseSettings}
        />
        <Route
            path='audits'
            component={Audits}
        />
        <Route
            path='logs'
            component={Logs}
        />
    </Route>
);
