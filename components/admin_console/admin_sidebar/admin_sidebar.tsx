// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
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

type Props = {
    license: Object;
    config: any;
    plugins?: any;
    adminDefinition: any;
    buildEnterpriseReady?: Boolean;
    siteName?: string;
    onFilterChange: (e?: any) => void;
    navigationBlocked: Boolean;
    intl: IntlShape;
    actions: { getPlugins: (e? : any) => void };
}

type State = {
    sections: any;
    filter: any;
}



const renderScrollView = (props: Props) => (
    <div
        {...props}
        className='scrollbar--view'
    />
);

const renderScrollThumbHorizontal = (props: Props) => (
    <div
        {...props}
        className='scrollbar--horizontal'
    />
);

const renderScrollThumbVertical = (props: Props) => (
    <div
        {...props}
        className='scrollbar--vertical'
    />
);

class AdminSidebar extends React.Component <Props, State> {

    static defaultProps = {
        plugins: {},
    }
    idx: any;
    searchRef: React.RefObject<any>;
    constructor(props: Props) {
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

    componentDidUpdate(prevProps: Props) {
        if (this.idx !== null &&
            (!isEqual(this.props.plugins, prevProps.plugins) ||
                !isEqual(this.props.adminDefinition, prevProps.adminDefinition))) {
            this.idx = generateIndex(this.props.adminDefinition, this.props.plugins, this.props.intl);
        }
    }

    onFilterChange = (e: any) => {
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
        const isVisible = (item: any) => {
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
        Object.values(this.props.adminDefinition).forEach(function (section: any) {
            Object.values(section).forEach(function (item: any) {
                if (isVisible(item)) {
                    result.add(item.url);
                }
            });
        });
        return result;
    }

    renderRootMenu = (definition: any) => {
        const sidebarSections: any = [];
        Object.values(definition).forEach((section: any, sectionIndex) => {
            const sidebarItems: any = [];
            Object.values(section).forEach((item: any, itemIndex) => {
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

                sidebarItems.push((
                    <AdminSidebarSection
                        key={itemIndex}
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
                        key={sectionIndex}
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
            return null;
        });
        return sidebarSections;
    }

    renderPluginsMenu = () => {
        const customPlugins: any = [];
        if (this.props.config.PluginSettings.Enable) {
            Object.values(this.props.plugins).sort((a: any, b: any) => {
                const nameCompare = a.name.localeCompare(b.name);
                if (nameCompare !== 0) {
                    return nameCompare;
                }

                return a.id.localeCompare(b.id);
            }).forEach((p: any) => {
                const hasSettings = p.settings_schema && (p.settings_schema.header || p.settings_schema.footer || p.settings_schema.settings);
                if (!hasSettings) {
                    return;
                }

                if (p.settings_schema.settings && (!p.settings_schema.header && !p.settings_schema.footer)) {
                    if (p.settings_schema.settings.hasOwnProperty('length')) {
                        if (p.settings_schema.settings.length === 0) {
                            return;
                        }
                    }
                }

                if (this.state.sections !== null && this.state.sections.indexOf(`plugin_${p.id}`) === -1) {
                    return;
                }
                customPlugins.push(
                    <AdminSidebarSection
                        key={'customplugin' + p.id}
                        name={'plugins/plugin_' + p.id}
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
        return (
            <div className='admin-sidebar'>
                <AdminSidebarHeader/>
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
                                <li className='filter-container'>
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
                                </li>
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
