// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import AdminSidebarCategory from 'components/admin_console/admin_sidebar_category.jsx';
import AdminSidebarHeader from 'components/admin_console/admin_sidebar_header';
import AdminSidebarSection from 'components/admin_console/admin_sidebar_section.jsx';
import AdminDefinition from 'components/admin_console/admin_definition.jsx';

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

    renderSettingsMenu = (section) => {
        const menuEntries = [];
        Object.values(section).forEach((item) => {
            if (!item.schema) {
                return;
            }

            if (!item.title) {
                return;
            }

            if (item.isHidden && item.isHidden(this.props.config, {}, this.props.license, this.props.buildEnterpriseReady)) {
                return;
            }

            menuEntries.push((
                <AdminSidebarSection
                    key={item.url}
                    name={item.url}
                    title={
                        <FormattedMessage
                            id={item.title}
                            defaultMessage={item.title_default}
                        />
                    }
                />
            ));
        });

        if (menuEntries.length === 0) {
            return null;
        }

        // Special case for plugins entries
        let extraEntries;
        if (section.url === 'plugins') {
            extraEntries = this.renderPluginsMenu();
        }

        return (
            <AdminSidebarSection
                key={section.url}
                name={section.url}
                type='text'
                title={
                    <FormattedMessage
                        id={section.title}
                        defaultMessage={section.title_default}
                    />
                }
            >
                {menuEntries}
                {extraEntries}
            </AdminSidebarSection>
        );
    }

    renderRootMenu = (section, icon, title, titleDefault) => {
        const menuEntries = [];
        Object.values(section).forEach((item) => {
            if (!item.title) {
                return;
            }

            if (item.isHidden && item.isHidden(this.props.config, {}, this.props.license, this.props.buildEnterpriseReady)) {
                return;
            }

            menuEntries.push((
                <AdminSidebarSection
                    key={item.url}
                    name={item.url}
                    title={
                        <FormattedMessage
                            id={item.title}
                            defaultMessage={item.title_default}
                        />
                    }
                />
            ));
        });

        if (menuEntries.length === 0) {
            return null;
        }

        return (
            <AdminSidebarCategory
                parentLink='/admin_console'
                icon={icon}
                title={
                    <FormattedMessage
                        id={title}
                        defaultMessage={titleDefault}
                    />
                }
            >
                {menuEntries}
            </AdminSidebarCategory>
        );
    }

    renderPluginsMenu = () => {
        const customPlugins = [];
        if (this.props.config.PluginSettings.Enable) {
            Object.values(this.props.plugins).sort((a, b) => {
                const nameCompare = a.name.localeCompare(b.name);
                if (nameCompare !== 0) {
                    return nameCompare;
                }

                return a.id.localeCompare(b.id);
            }).forEach((p) => {
                const hasSettings = p.settings_schema && (p.settings_schema.header || p.settings_schema.footer || p.settings_schema.settings.length > 0);
                if (!hasSettings) {
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
        return customPlugins;
    }

    render() {
        return (
            <div className='admin-sidebar'>
                <AdminSidebarHeader/>
                <div className='nav-pills__container'>
                    <ul className='nav nav-pills nav-stacked'>
                        {this.renderRootMenu(AdminDefinition.reporting, 'fa-bar-chart', 'admin.sidebar.reports', 'REPORTING')}
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
                            {Object.values(AdminDefinition.settings).map(this.renderSettingsMenu)}
                        </AdminSidebarCategory>
                        {this.renderRootMenu(AdminDefinition.other, 'fa-wrench', 'admin.sidebar.other', 'OTHER')}
                    </ul>
                </div>
            </div>
        );
    }
}
