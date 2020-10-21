// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import Scrollbars from 'react-custom-scrollbars';
import isEqual from 'lodash/isEqual';

import * as Utils from 'utils/utils.jsx';
import {generateIndex} from 'utils/admin_console_index.jsx';
import {browserHistory} from 'utils/browser_history';
import {intlShape} from 'utils/react_intl';

import AdminSidebarCategory from 'components/admin_console/admin_sidebar_category.jsx';
import AdminSidebarHeader from 'components/admin_console/admin_sidebar_header';
import AdminSidebarSection from 'components/admin_console/admin_sidebar_section.jsx';
import Highlight from 'components/admin_console/highlight';
import SearchIcon from 'components/widgets/icons/search_icon.jsx';
import QuickInput from 'components/quick_input';

const renderScrollView = (props) => (
    <div
        {...props}
        className='scrollbar--view'
    />
);

const renderScrollThumbHorizontal = (props) => (
    <div
        {...props}
        className='scrollbar--horizontal'
    />
);

const renderScrollThumbVertical = (props) => (
    <div
        {...props}
        className='scrollbar--vertical'
    />
);

class AdminSidebar extends React.PureComponent {
    static propTypes = {
        license: PropTypes.object.isRequired,
        config: PropTypes.object,
        plugins: PropTypes.object,
        adminDefinition: PropTypes.object,
        cloud: PropTypes.object,
        buildEnterpriseReady: PropTypes.bool,
        siteName: PropTypes.string,
        onFilterChange: PropTypes.func.isRequired,
        navigationBlocked: PropTypes.bool.isRequired,
        consoleAccess: PropTypes.object,
        intl: intlShape.isRequired,
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
        this.searchRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.config.PluginSettings.Enable) {
            this.props.actions.getPlugins();
        }

        if (this.searchRef.current) {
            this.searchRef.current.focus();
        }

        this.updateTitle();
    }

    componentDidUpdate(prevProps) {
        if (this.idx !== null &&
            (!isEqual(this.props.plugins, prevProps.plugins) ||
                !isEqual(this.props.adminDefinition, prevProps.adminDefinition))) {
            this.idx = generateIndex(this.props.adminDefinition, this.props.plugins, this.props.intl);
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
            this.idx = generateIndex(this.props.adminDefinition, this.props.plugins, this.props.intl);
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

        const validSection = sections.indexOf(browserHistory.location.pathname.replace('/admin_console/', '')) !== -1;
        if (!validSection) {
            const visibleSections = this.visibleSections();
            for (const section of sections) {
                if (visibleSections.has(section)) {
                    browserHistory.replace('/admin_console/' + section);
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
        const {config, license, buildEnterpriseReady, consoleAccess, adminDefinition, cloud} = this.props;
        const isVisible = (item) => {
            if (!item.schema) {
                return false;
            }

            if (!item.title) {
                return false;
            }

            if (item.isHidden && item.isHidden(config, this.state, license, buildEnterpriseReady, consoleAccess, cloud)) {
                return false;
            }
            return true;
        };
        const result = new Set();
        for (const section of Object.values(adminDefinition)) {
            for (const item of Object.values(section)) {
                if (isVisible(item)) {
                    result.add(item.url);
                }
            }
        }
        return result;
    }

    renderRootMenu = (definition) => {
        const {config, license, buildEnterpriseReady, consoleAccess, cloud} = this.props;
        const sidebarSections = [];
        Object.entries(definition).forEach(([key, section]) => {
            let isSectionHidden = false;
            if (section.isHidden) {
                isSectionHidden = typeof section.isHidden === 'function' ? section.isHidden(config, this.state, license, buildEnterpriseReady, consoleAccess, cloud) : Boolean(section.isHidden);
            }
            if (!isSectionHidden) {
                const sidebarItems = [];
                Object.entries(section).forEach(([subKey, item]) => {
                    if (!item.title) {
                        return;
                    }

                    if (item.isHidden) {
                        if (typeof item.isHidden === 'function' ? item.isHidden(config, this.state, license, buildEnterpriseReady, consoleAccess, cloud) : Boolean(item.isHidden)) {
                            return;
                        }
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
                    const subDefinitionKey = `${key}.${subKey}`;
                    sidebarItems.push((
                        <AdminSidebarSection
                            key={subDefinitionKey}
                            definitionKey={subDefinitionKey}
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

                // Special case for plugins entries
                let moreSidebarItems = [];
                if (section.id === 'plugins') {
                    moreSidebarItems = this.renderPluginsMenu();
                }

                // If no visible items, don't display this section
                if (sidebarItems.length === 0 && moreSidebarItems.length === 0) {
                    return null;
                }

                if (sidebarItems.length || moreSidebarItems.length) {
                    sidebarSections.push((
                        <AdminSidebarCategory
                            key={key}
                            definitionKey={key}
                            parentLink='/admin_console'
                            icon={section.icon}
                            sectionClass=''
                            title={
                                <FormattedMessage
                                    id={section.sectionTitle}
                                    defaultMessage={section.sectionTitleDefault}
                                />
                            }
                        >
                            {sidebarItems}
                            {moreSidebarItems}
                        </AdminSidebarCategory>
                    ));
                }
            }
            return null;
        });
        return sidebarSections;
    }

    isPluginPresentInSections = (plugin) => {
        return this.state.sections && this.state.sections.indexOf(`plugin_${plugin.id}`) !== -1;
    }

    renderPluginsMenu = () => {
        if (this.props.config.PluginSettings.Enable) {
            return Object.values(this.props.plugins).sort((a, b) => {
                const nameCompare = a.name.localeCompare(b.name);
                if (nameCompare !== 0) {
                    return nameCompare;
                }

                return a.id.localeCompare(b.id);
            }).
                filter((plugin) => this.state.sections === null || this.isPluginPresentInSections(plugin)).
                map((plugin) => {
                    return (
                        <AdminSidebarSection
                            key={'customplugin' + plugin.id}
                            name={'plugins/plugin_' + plugin.id}
                            title={plugin.name}
                        />
                    );
                });
        }

        return [];
    }

    handleClearFilter = () => {
        this.setState({sections: null, filter: ''});
        this.props.onFilterChange('');
    }

    render() {
        return (
            <div className='admin-sidebar'>
                <AdminSidebarHeader/>
                <div className='filter-container'>
                    <SearchIcon
                        className='search__icon'
                        aria-hidden='true'
                    />
                    <QuickInput
                        className={'filter ' + (this.state.filter ? 'active' : '')}
                        type='text'
                        onChange={this.onFilterChange}
                        value={this.state.filter}
                        placeholder={Utils.localizeMessage('admin.sidebar.filter', 'Find settings')}
                        ref={this.searchRef}
                        id='adminSidebarFilter'
                        clearable={true}
                        onClear={this.handleClearFilter}
                    />
                </div>
                <Scrollbars
                    ref='scrollbar'
                    autoHide={true}
                    autoHideTimeout={500}
                    autoHideDuration={500}
                    renderThumbHorizontal={renderScrollThumbHorizontal}
                    renderThumbVertical={renderScrollThumbVertical}
                    renderView={renderScrollView}
                >
                    <div className='nav-pills__container'>
                        <Highlight filter={this.state.filter}>
                            <ul className='nav nav-pills nav-stacked'>
                                {this.renderRootMenu(this.props.adminDefinition)}
                            </ul>
                        </Highlight>
                    </div>
                </Scrollbars>
            </div>
        );
    }
}

export default injectIntl(AdminSidebar);
/* eslint-enable react/no-string-refs */
