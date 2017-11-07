// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

import AdminSidebarCategory from './admin_sidebar_category.jsx';
import AdminSidebarHeader from './admin_sidebar_header.jsx';
import AdminSidebarSection from './admin_sidebar_section.jsx';

export default class AdminSidebar extends React.Component {
    static get contextTypes() {
        return {
            router: PropTypes.object.isRequired
        };
    }

    constructor(props) {
        super(props);

        this.updateTitle = this.updateTitle.bind(this);
    }

    componentDidMount() {
        this.updateTitle();

        if (!Utils.isMobile()) {
            $('.admin-sidebar .nav-pills__container').perfectScrollbar({
                suppressScrollX: true
            });
        }
    }

    componentDidUpdate() {
        if (!Utils.isMobile()) {
            $('.admin-sidebar .nav-pills__container').perfectScrollbar({
                suppressScrollX: true
            });
        }
    }

    updateTitle() {
        let currentSiteName = '';
        if (global.window.mm_config.SiteName != null) {
            currentSiteName = global.window.mm_config.SiteName;
        }

        document.title = Utils.localizeMessage('sidebar_right_menu.console', 'System Console') + ' - ' + currentSiteName;
    }

    render() {
        let oauthSettings = null;
        let ldapSettings = null;
        let samlSettings = null;
        let clusterSettings = null;
        let metricsSettings = null;
        let complianceSettings = null;
        let mfaSettings = null;

        let license = null;
        let audits = null;
        let policy = null;

        if (window.mm_config.BuildEnterpriseReady === 'true') {
            license = (
                <AdminSidebarSection
                    name='license'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.license'
                            defaultMessage='Edition and License'
                        />
                    }
                />
            );
        }

        if (window.mm_license.IsLicensed === 'true') {
            if (global.window.mm_license.LDAP === 'true') {
                ldapSettings = (
                    <AdminSidebarSection
                        name='ldap'
                        title={
                            <FormattedMessage
                                id='admin.sidebar.ldap'
                                defaultMessage='AD/LDAP'
                            />
                        }
                    />
                );
            }

            if (global.window.mm_license.Cluster === 'true') {
                clusterSettings = (
                    <AdminSidebarSection
                        name='cluster'
                        title={
                            <FormattedMessage
                                id='admin.sidebar.cluster'
                                defaultMessage='High Availability'
                            />
                        }
                    />
                );
            }

            if (global.window.mm_license.Metrics === 'true') {
                metricsSettings = (
                    <AdminSidebarSection
                        name='metrics'
                        title={
                            <FormattedMessage
                                id='admin.sidebar.metrics'
                                defaultMessage='Performance Monitoring'
                            />
                        }
                    />
                );
            }

            if (global.window.mm_license.SAML === 'true') {
                samlSettings = (
                    <AdminSidebarSection
                        name='saml'
                        title={
                            <FormattedMessage
                                id='admin.sidebar.saml'
                                defaultMessage='SAML 2.0'
                            />
                        }
                    />
                );
            }

            if (global.window.mm_license.Compliance === 'true') {
                complianceSettings = (
                    <AdminSidebarSection
                        name='compliance'
                        title={
                            <FormattedMessage
                                id='admin.sidebar.compliance'
                                defaultMessage='Compliance'
                            />
                        }
                    />
                );
            }

            if (global.window.mm_license.MFA === 'true') {
                mfaSettings = (
                    <AdminSidebarSection
                        name='mfa'
                        title={
                            <FormattedMessage
                                id='admin.sidebar.mfa'
                                defaultMessage='MFA'
                            />
                        }
                    />
                );
            }

            oauthSettings = (
                <AdminSidebarSection
                    name='oauth'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.oauth'
                            defaultMessage='OAuth 2.0'
                        />
                    }
                />
            );

            policy = (
                <AdminSidebarSection
                    name='policy'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.policy'
                            defaultMessage='Policy'
                        />
                    }
                />
            );
        } else {
            oauthSettings = (
                <AdminSidebarSection
                    name='gitlab'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.gitlab'
                            defaultMessage='GitLab'
                        />
                    }
                />
            );
        }

        if (window.mm_license.IsLicensed === 'true') {
            audits = (
                <AdminSidebarSection
                    name='audits'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.audits'
                            defaultMessage='Complaince and Auditing'
                        />
                    }
                />
            );
        }

        let customBranding = null;

        if (window.mm_license.IsLicensed === 'true') {
            customBranding = (
                <AdminSidebarSection
                    name='custom_brand'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.customBrand'
                            defaultMessage='Custom Branding'
                        />
                    }
                />
            );
        }

        let otherCategory = null;
        if (license || audits) {
            otherCategory = (
                <AdminSidebarCategory
                    parentLink='/admin_console'
                    icon='fa-wrench'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.other'
                            defaultMessage='OTHER'
                        />
                    }
                >
                    {license}
                    {audits}
                </AdminSidebarCategory>
            );
        }

        const webrtcSettings = (
            <AdminSidebarSection
                name='webrtc'
                title={
                    <FormattedMessage
                        id='admin.sidebar.webrtc'
                        defaultMessage='WebRTC (Beta)'
                    />
                }
            />
        );

        let elasticSearchSettings = null;
        if (window.mm_license.IsLicensed === 'true' && window.mm_license.Elasticsearch === 'true') {
            elasticSearchSettings = (
                <AdminSidebarSection
                    name='elasticsearch'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.elasticsearch'
                            defaultMessage='Elasticsearch (Beta)'
                        />
                    }
                />
            );
        }

        let dataRetentionSettings = null;
        if (window.mm_license.IsLicensed === 'true' && window.mm_license.DataRetention === 'true') {
            dataRetentionSettings = (
                <AdminSidebarSection
                    name='dataretention'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.data_retention'
                            defaultMessage='Data Retention Policy (Beta)'
                        />
                    }
                />
            );
        }

        const SHOW_CLIENT_VERSIONS = false;
        let clientVersions = null;
        if (SHOW_CLIENT_VERSIONS) {
            clientVersions = (
                <AdminSidebarSection
                    name='client_versions'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.client_versions'
                            defaultMessage='Client Versions'
                        />
                    }
                />
            );
        }

        return (
            <div className='admin-sidebar'>
                <AdminSidebarHeader/>
                <div className='nav-pills__container'>
                    <ul className='nav nav-pills nav-stacked'>
                        <AdminSidebarCategory
                            parentLink='/admin_console'
                            icon='fa-bar-chart'
                            title={
                                <FormattedMessage
                                    id='admin.sidebar.reports'
                                    defaultMessage='REPORTING'
                                />
                            }
                        >
                            <AdminSidebarSection
                                name='system_analytics'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.view_statistics'
                                        defaultMessage='Site Statistics'
                                    />
                                }
                            />
                            <AdminSidebarSection
                                name='team_analytics'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.statistics'
                                        defaultMessage='Team Statistics'
                                    />
                                }
                            />
                            <AdminSidebarSection
                                name='users'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.users'
                                        defaultMessage='Users'
                                    />
                                }
                            />
                            <AdminSidebarSection
                                name='logs'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.logs'
                                        defaultMessage='Logs'
                                    />
                                }
                            />
                        </AdminSidebarCategory>
                        <AdminSidebarCategory
                            sectionClass='sections--settings'
                            parentLink='/admin_console'
                            icon='fa-gear'
                            title={
                                <FormattedMessage
                                    id='admin.sidebar.settings'
                                    defaultMessage='SETTINGS'
                                />
                            }
                        >
                            <AdminSidebarSection
                                name='general'
                                type='text'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.general'
                                        defaultMessage='General'
                                    />
                                }
                            >
                                <AdminSidebarSection
                                    name='configuration'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.configuration'
                                            defaultMessage='Configuration'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='localization'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.localization'
                                            defaultMessage='Localization'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='users_and_teams'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.usersAndTeams'
                                            defaultMessage='Users and Teams'
                                        />
                                    }
                                />
                                {policy}
                                <AdminSidebarSection
                                    name='privacy'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.privacy'
                                            defaultMessage='Privacy'
                                        />
                                    }
                                />
                                {complianceSettings}
                                <AdminSidebarSection
                                    name='logging'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.logging'
                                            defaultMessage='Logging'
                                        />
                                    }
                                />
                            </AdminSidebarSection>
                            <AdminSidebarSection
                                name='authentication'
                                type='text'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.authentication'
                                        defaultMessage='Authentication'
                                    />
                                }
                            >
                                <AdminSidebarSection
                                    name='authentication_email'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.email'
                                            defaultMessage='Email'
                                        />
                                    }
                                />
                                {oauthSettings}
                                {ldapSettings}
                                {samlSettings}
                                {mfaSettings}
                            </AdminSidebarSection>
                            <AdminSidebarSection
                                name='security'
                                type='text'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.security'
                                        defaultMessage='Security'
                                    />
                                }
                            >
                                <AdminSidebarSection
                                    name='sign_up'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.signUp'
                                            defaultMessage='Sign Up'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='password'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.password'
                                            defaultMessage='Password'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='public_links'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.publicLinks'
                                            defaultMessage='Public Links'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='sessions'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.sessions'
                                            defaultMessage='Sessions'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='connections'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.connections'
                                            defaultMessage='Connections'
                                        />
                                    }
                                />
                                {clientVersions}
                            </AdminSidebarSection>
                            <AdminSidebarSection
                                name='notifications'
                                type='text'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.notifications'
                                        defaultMessage='Notifications'
                                    />
                                }
                            >
                                <AdminSidebarSection
                                    name='notifications_email'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.email'
                                            defaultMessage='Email'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='push'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.push'
                                            defaultMessage='Mobile Push'
                                        />
                                    }
                                />
                            </AdminSidebarSection>
                            <AdminSidebarSection
                                name='integrations'
                                type='text'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.integrations'
                                        defaultMessage='Integrations'
                                    />
                                }
                            >
                                <AdminSidebarSection
                                    name='custom'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.customIntegrations'
                                            defaultMessage='Custom Integrations'
                                        />
                                    }
                                />
                                {webrtcSettings}
                                <AdminSidebarSection
                                    name='external'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.external'
                                            defaultMessage='External Services'
                                        />
                                    }
                                />
                            </AdminSidebarSection>
                            <AdminSidebarSection
                                name='plugins'
                                type='text'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.plugins'
                                        defaultMessage='Plugins (Beta)'
                                    />
                                }
                            >
                                <AdminSidebarSection
                                    name='configuration'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.plugins.configuration'
                                            defaultMessage='Configuration'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='management'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.plugins.management'
                                            defaultMessage='Management'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='jira'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.jira'
                                            defaultMessage='JIRA (Beta)'
                                        />
                                    }
                                />
                            </AdminSidebarSection>
                            <AdminSidebarSection
                                name='files'
                                type='text'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.files'
                                        defaultMessage='Files'
                                    />
                                }
                            >
                                <AdminSidebarSection
                                    key='storage'
                                    name='storage'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.storage'
                                            defaultMessage='Storage'
                                        />
                                    }
                                />
                            </AdminSidebarSection>
                            <AdminSidebarSection
                                name='customization'
                                type='text'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.customization'
                                        defaultMessage='Customization'
                                    />
                                }
                            >
                                {customBranding}
                                <AdminSidebarSection
                                    name='emoji'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.emoji'
                                            defaultMessage='Emoji'
                                        />

                                    }
                                />
                                <AdminSidebarSection
                                    name='link_previews'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.linkPreviews'
                                            defaultMessage='Link Previews'
                                        />

                                    }
                                />
                                <AdminSidebarSection
                                    name='legal_and_support'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.legalAndSupport'
                                            defaultMessage='Legal and Support'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='native_app_links'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.nativeAppLinks'
                                            defaultMessage='Mattermost App Links'
                                        />

                                    }
                                />
                            </AdminSidebarSection>
                            <AdminSidebarSection
                                name='advanced'
                                type='text'
                                title={
                                    <FormattedMessage
                                        id='admin.sidebar.advanced'
                                        defaultMessage='Advanced'
                                    />
                                }
                            >
                                <AdminSidebarSection
                                    name='rate'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.rateLimiting'
                                            defaultMessage='Rate Limiting'
                                        />
                                    }
                                />
                                <AdminSidebarSection
                                    name='database'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.database'
                                            defaultMessage='Database'
                                        />
                                    }
                                />
                                {dataRetentionSettings}
                                {elasticSearchSettings}
                                <AdminSidebarSection
                                    name='developer'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.developer'
                                            defaultMessage='Developer'
                                        />
                                    }
                                />
                                {clusterSettings}
                                {metricsSettings}
                            </AdminSidebarSection>
                        </AdminSidebarCategory>
                        {otherCategory}
                    </ul>
                </div>
            </div>
        );
    }
}
