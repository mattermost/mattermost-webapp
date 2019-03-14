// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, intlShape} from 'react-intl';
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

import * as Utils from 'utils/utils.jsx';
import Constants from 'utils/constants.jsx';
import {generateIndex} from 'utils/admin_console_index.jsx';

import AdminSidebarCategory from 'components/admin_console/admin_sidebar_category.jsx';
import AdminSidebarHeader from 'components/admin_console/admin_sidebar_header';
import AdminSidebarSection from 'components/admin_console/admin_sidebar_section.jsx';
import AdminDefinition from 'components/admin_console/admin_definition.jsx';
import Highlight from 'components/admin_console/highlight.jsx';
import SearchIcon from 'components/svg/search_icon.jsx';

export default class AdminSidebar extends React.Component {
    static get contextTypes() {
        return {
            router: PropTypes.object.isRequired,
            intl: intlShape.isRequired,
        };
    }

    static propTypes = {
        license: PropTypes.object.isRequired,
        config: PropTypes.object,
        plugins: PropTypes.object,
        buildEnterpriseReady: PropTypes.bool,
        siteName: PropTypes.string,
        onFilterChange: PropTypes.func.isRequired,
        navigationBlocked: PropTypes.bool.isRequired,
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

    constructor(props) {
        super(props);
        this.state = {
            sections: null,
            filter: '',
        };
        this.idx = null;
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

    onFilterChange = (e) => {
        const filter = e.target.value;
        if (filter === '') {
            this.setState({sections: null, filter});
            this.props.onFilterChange(filter);
            return;
        }

        if (this.idx === null) {
            this.idx = generateIndex(this.context.intl);
        }
        let query = '';
        for (const term of filter.split(' ')) {
            term.trim();
            if (term !== '') {
                query += term + ' ';
                query += term + '* ';
            }
        }
        const sections = this.idx.search(query);
        this.setState({sections, filter});
        this.props.onFilterChange(filter);

        if (this.props.navigationBlocked) {
            return;
        }

        const validSection = sections.indexOf(this.context.router.history.location.pathname.replace('/admin_console/', '')) !== -1;
        if (!validSection) {
            const visibleSections = this.visibleSections();
            for (const section of sections) {
                if (visibleSections.has(section)) {
                    this.context.router.history.replace('/admin_console/' + section);
                    break;
                }
            }
        }
    }

    updateTitle = () => {
        let currentSiteName = '';
        if (this.props.siteName) {
            currentSiteName = ' - ' + this.props.siteName;
        }

        document.title = Utils.localizeMessage('sidebar_right_menu.console', 'System Console') + currentSiteName;
    }

    visibleSections = () => {
        const isVisible = (item) => {
            if (!item.schema) {
                return false;
            }

            if (!item.title) {
                return false;
            }

            if (item.isHidden && item.isHidden(this.props.config, {}, this.props.license, this.props.buildEnterpriseReady)) {
                return false;
            }
            return true;
        };
        const result = new Set();
        for (const item of Object.values(AdminDefinition.reporting)) {
            if (isVisible(item)) {
                result.add(item.url);
            }
        }
        for (const item of Object.values(AdminDefinition.other)) {
            if (isVisible(item)) {
                result.add(item.url);
            }
        }
        for (const section of Object.values(AdminDefinition.settings)) {
            for (const item of Object.values(section)) {
                if (isVisible(item)) {
                    result.add(section.url + '/' + item.url);
                }
            }
        }
        return result;
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

            if (this.state.sections !== null) {
                let active = false;
                for (const url of this.state.sections) {
                    if (url.endsWith('/' + item.url)) {
                        active = true;
                    }
                }
                if (!active) {
                    return;
                }
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

            if (this.state.sections !== null) {
                let active = false;
                for (const url of this.state.sections) {
                    if (url === item.url) {
                        active = true;
                    }
                }
                if (!active) {
                    return;
                }
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

    handleClearFilter = () => {
        this.setState({sections: null, filter: ''});
        this.props.onFilterChange('');
    }

    render() {
        const filterClearTooltip = (
            <Tooltip id='admin-sidebar-fitler-clear'>
                <FormattedMessage
                    id='admin.sidebar.filter-clear'
                    defaultMessage='Clear search'
                />
            </Tooltip>
        );
        return (
            <div className='admin-sidebar'>
                <AdminSidebarHeader/>
                <div className='nav-pills__container'>
                    <Highlight filter={this.state.filter}>
                        <ul className='nav nav-pills nav-stacked'>
                            <li className='filter-container'>
                                <SearchIcon
                                    id='searchIcon'
                                    className='search__icon'
                                    aria-hidden='true'
                                />
                                <input
                                    className={'filter ' + (this.state.filter ? 'active' : '')}
                                    type='text'
                                    onChange={this.onFilterChange}
                                    value={this.state.filter}
                                    placeholder={Utils.localizeMessage('admin.sidebar.filter', 'Find settings')}
                                />
                                {this.state.filter &&
                                    <div
                                        className='sidebar__search-clear visible'
                                        onClick={this.handleClearFilter}
                                    >
                                        <OverlayTrigger
                                            trigger={['hover', 'focus']}
                                            delayShow={Constants.OVERLAY_TIME_DELAY}
                                            placement='bottom'
                                            overlay={filterClearTooltip}
                                        >
                                            <span
                                                className='sidebar__search-clear-x'
                                                aria-hidden='true'
                                            >
                                                {'×'}
                                            </span>
                                        </OverlayTrigger>
                                    </div>}
                            </li>

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
                    </Highlight>
                </div>
            </div>
        );
    }
}
