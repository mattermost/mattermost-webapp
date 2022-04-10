// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import Scrollbars from 'react-custom-scrollbars';
import isEqual from 'lodash/isEqual';

import classNames from 'classnames';

import {IntlShape} from 'react-intl/lib';

import * as Utils from 'utils/utils.jsx';
import {generateIndex} from 'utils/admin_console_index.jsx';
import {browserHistory} from 'utils/browser_history';

import AdminSidebarCategory from 'components/admin_console/admin_sidebar_category.jsx';
import AdminSidebarHeader from 'components/admin_console/admin_sidebar_header';
import AdminSidebarSection from 'components/admin_console/admin_sidebar_section.jsx';
import Highlight from 'components/admin_console/highlight';
import SearchIcon from 'components/widgets/icons/search_icon';
import QuickInput from 'components/quick_input';

import {AdminConfig, ClientLicense} from 'mattermost-redux/types/config';
import {PluginRedux, PluginsResponse} from 'mattermost-redux/types/plugins';
import {CloudState} from 'mattermost-redux/types/cloud';
import {ConsoleAccess} from 'mattermost-redux/types/admin';

import AdminDefinition from '../admin_definition';

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

export type Props = {
    adminDefinition: typeof AdminDefinition;
    buildEnterpriseReady: boolean;
    config: DeepPartial<AdminConfig>;
    consoleAccess: ConsoleAccess;
    cloud: CloudState;
    intl: IntlShape;
    license: ClientLicense;
    navigationBlocked: boolean;
    onFilterChange: (term: string) => void;
    showTaskList: boolean;
    plugins?: Record<string, PluginRedux>;
    siteName?: string;
    actions: {

        /*
        * Function to get installed plugins
        */
        getPlugins: () => Promise<{data: PluginsResponse}>;
    };
}

type State = {
    sections: string[] | null;
    filter: string;
}

class AdminSidebar extends React.PureComponent<Props, State> {
    searchRef: React.RefObject<HTMLInputElement>;
    idx: any;

    static defaultProps = {
        plugins: {},
    }

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
        if (this.props.config.PluginSettings!.Enable) {
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

    onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const isVisible = (item: any) => {
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

    renderRootMenu = (definition: typeof AdminDefinition) => {
        const {config, license, buildEnterpriseReady, consoleAccess, cloud} = this.props;
        const sidebarSections: JSX.Element[] = [];
        Object.entries(definition).forEach(([key, section]) => {
            let isSectionHidden = false;
            if (section.isHidden) {
                isSectionHidden = typeof section.isHidden === 'function' ? section.isHidden(config, this.state, license, buildEnterpriseReady, consoleAccess, cloud) : Boolean(section.isHidden);
            }
            if (!isSectionHidden) {
                const sidebarItems: JSX.Element[] = [];
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
                    let tag = '';
                    if (item.tag?.shouldDisplay(license)) {
                        tag = item.tag.value;
                    }
                    sidebarItems.push((
                        <AdminSidebarSection
                            key={subDefinitionKey}
                            definitionKey={subDefinitionKey}
                            name={item.url}
                            tag={tag}
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
                let moreSidebarItems: JSX.Element[] = [];
                if ((section as typeof AdminDefinition['plugins']).id === 'plugins') {
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

    isPluginPresentInSections = (plugin: PluginRedux) => {
        return this.state.sections && this.state.sections.indexOf(`plugin_${plugin.id}`) !== -1;
    }

    renderPluginsMenu = () => {
        if (this.props.config.PluginSettings!.Enable) {
            return Object.values(this.props.plugins!).sort((a, b) => {
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
        const {showTaskList} = this.props;
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
                            <ul className={classNames('nav nav-pills nav-stacked', {'task-list-shown': showTaskList})}>
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
