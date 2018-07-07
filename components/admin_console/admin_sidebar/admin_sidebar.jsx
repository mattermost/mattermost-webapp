// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import AdminSidebarCategory from 'components/admin_console/admin_sidebar_category.jsx';
import AdminSidebarHeader from 'components/admin_console/admin_sidebar_header.jsx';
import AdminSidebarSection from 'components/admin_console/admin_sidebar_section.jsx';

export default class AdminSidebar extends React.Component {
    static get contextTypes() {
        return {
            router: PropTypes.object.isRequired,
        };
    }

    static propTypes = {
        license: PropTypes.object.isRequired,
        config: PropTypes.object,
        plugins: PropTypes.object,
        buildEnterpriseReady: PropTypes.bool,
        siteName: PropTypes.string,
        actions: PropTypes.shape({

            /*
             * Function to get installed plugins
             */
            getPlugins: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        plugins: {},
    }

    componentDidMount() {
        if (this.props.config.PluginSettings.Enable) {
            this.props.actions.getPlugins();
        }

        this.updateTitle();

        if (!Utils.isMobile()) {
            $('.admin-sidebar .nav-pills__container').perfectScrollbar({
                suppressScrollX: true,
            });
        }
    }

    componentDidUpdate() {
        if (!Utils.isMobile()) {
            $('.admin-sidebar .nav-pills__container').perfectScrollbar({
                suppressScrollX: true,
            });
        }
    }

    updateTitle = () => {
        let currentSiteName = '';
        if (this.props.siteName) {
            currentSiteName = ' - ' + this.props.siteName;
        }

        document.title = Utils.localizeMessage('sidebar_right_menu.console', 'System Console') + currentSiteName;
    }

    render() {
        let oauthSettings = null;
        let ldapSettings = null;
        let samlSettings = null;
        let clusterSettings = null;
        let metricsSettings = null;
        let complianceSettings = null;
        let mfaSettings = null;
        let messageExportSettings = null;
        let complianceSection = null;

        let license = null;
        let audits = null;
        let announcement = null;

        if (this.props.buildEnterpriseReady) {
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

        if (this.props.license.IsLicensed === 'true') {
            if (this.props.license.LDAP === 'true') {
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

            if (this.props.license.Cluster === 'true') {
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

            if (this.props.license.Metrics === 'true') {
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

            if (this.props.license.SAML === 'true') {
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

            if (this.props.license.Compliance === 'true') {
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

            if (this.props.license.MFA === 'true') {
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

            if (this.props.license.MessageExport === 'true') {
                messageExportSettings = (
                    <AdminSidebarSection
                        name='message_export'
                        title={
                            <FormattedMessage
                                id='admin.sidebar.compliance_export'
                                defaultMessage='Compliance Export (Beta)'
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
            announcement = (
                <AdminSidebarSection
                    name='announcement'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.announcement'
                            defaultMessage='Announcement Banner'
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

        if (this.props.license.IsLicensed === 'true') {
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
        if (this.props.license.IsLicensed === 'true' && this.props.license.Elasticsearch === 'true') {
            elasticSearchSettings = (
                <AdminSidebarSection
                    name='elasticsearch'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.elasticsearch'
                            defaultMessage='Elasticsearch'
                        />
                    }
                />
            );
        }

        let dataRetentionSettings = null;
        if (this.props.license.IsLicensed === 'true' && this.props.license.DataRetention === 'true') {
            dataRetentionSettings = (
                <AdminSidebarSection
                    name='data_retention'
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

        if (dataRetentionSettings || messageExportSettings) {
            complianceSection = (
                <AdminSidebarSection
                    name='compliance'
                    type='text'
                    title={
                        <FormattedMessage
                            id='admin.sidebar.compliance'
                            defaultMessage='Compliance'
                        />
                    }
                >
                    {dataRetentionSettings}
                    {messageExportSettings}
                </AdminSidebarSection>
            );
        }

        const customPlugins = [];
        if (this.props.config.PluginSettings.Enable) {
            Object.values(this.props.plugins).forEach((p) => {
                if (!p.settings_schema || Object.keys(p.settings_schema) === 0) {
                    return;
                }

                customPlugins.push(
                    <AdminSidebarSection
                        key={'customplugin' + p.id}
                        name={'custom/' + p.id}
                        title={p.name}
                    />
                );
            });
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
                            {this.props.license.IsLicensed === 'true' &&
                                <AdminSidebarSection
                                    name='permissions'
                                    type='text'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.permissions'
                                            defaultMessage='Advanced Permissions'
                                        />
                                    }
                                >
                                    {this.props.license.CustomPermissionsSchemes !== 'true' &&
                                        <AdminSidebarSection
                                            name='system-scheme'
                                            title={
                                                <FormattedMessage
                                                    id='admin.sidebar.system-scheme'
                                                    defaultMessage='System scheme'
                                                />
                                            }
                                        />}
                                    {this.props.license.CustomPermissionsSchemes === 'true' &&
                                        <AdminSidebarSection
                                            name='schemes'
                                            title={
                                                <FormattedMessage
                                                    id='admin.sidebar.schemes'
                                                    defaultMessage='Permission Schemes'
                                                />
                                            }
                                        />}
                                </AdminSidebarSection>}
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
                                {customPlugins}
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
                                <AdminSidebarSection
                                    name='custom_brand'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.customBrand'
                                            defaultMessage='Custom Branding'
                                        />
                                    }
                                />
                                {announcement}
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
                                    name='gif'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.gif'
                                            defaultMessage='GIF (Beta)'
                                        />

                                    }
                                />
                                <AdminSidebarSection
                                    name='posts'
                                    title={
                                        <FormattedMessage
                                            id='admin.sidebar.posts'
                                            defaultMessage='Posts'
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
                            {complianceSection}
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
