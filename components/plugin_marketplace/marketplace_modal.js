// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import debounce from 'lodash/debounce';
import {Tabs, Tab, OverlayTrigger, Tooltip} from 'react-bootstrap';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';
import QuickInput from 'components/quick_input';
import LocalizedInput from 'components/localized_input/localized_input';
import PluginIcon from 'components/widgets/icons/plugin_icon.jsx';
import LoadingScreen from 'components/loading_screen';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {t} from 'utils/i18n';
import {localizeMessage} from 'utils/utils';
import Constants from 'utils/constants.jsx';

import MarketplaceItem from './marketplace_item';

import './marketplace_modal.scss';

const MarketplaceTabs = {
    ALL_PLUGINS: 'allPlugins',
    INSTALLED_PLUGINS: 'installed',
};

const SEARCH_TIMEOUT_MILLISECONDS = 200;

// Plugins renders the list of plugins in a tab.
export const Plugins = ({plugins}) => (
    <div className='more-modal__list'>{plugins.map((p) => (
        <MarketplaceItem
            key={p.manifest.id}
            id={p.manifest.id}
            name={p.manifest.name}
            description={p.manifest.description}
            version={p.manifest.version}
            isPrepackaged={false}
            downloadUrl={p.download_url}
            homepageUrl={p.homepage_url}
            releaseNotesUrl={p.release_notes_url}
            iconData={p.icon_data}
            installedVersion={p.installed_version}
        />
    ))}</div>
);

Plugins.propTypes = {
    plugins: PropTypes.array.isRequired,
};

// AllPlugins renders the contents of the all plugins tab.
export const AllPlugins = ({plugins}) => {
    if (plugins.length === 0) {
        return (
            <div className='no_plugins_div'>
                <br/>
                <PluginIcon className='icon__plugin'/>
                <div className='margin-top x2 light'>
                    <FormattedMessage
                        id='marketplace_modal.no_plugins'
                        defaultMessage='There are no plugins available at this time.'
                    />
                </div>
            </div>
        );
    }

    return <Plugins plugins={plugins}/>;
};

AllPlugins.propTypes = {
    plugins: PropTypes.array.isRequired,
};

// InstalledPlugins renders the contents of the installed plugins tab.
export const InstalledPlugins = ({installedPlugins}) => {
    if (installedPlugins.length === 0) {
        return (
            <div className='no_plugins_div'>
                <br/>
                <PluginIcon className='icon__plugin'/>
                <div className='margin-top x2 light'>
                    <FormattedMessage
                        id='marketplace_modal.no_plugins_installed'
                        defaultMessage='You do not have any plugins installed.'
                    />
                </div>
                <button
                    className='margin-top x3 style--none color--link'
                    onClick={() => this.changeTab(MarketplaceTabs.ALL_PLUGINS)}
                >
                    <FormattedMessage
                        id='marketplace_modal.install_plugins'
                        defaultMessage='Install Plugins'
                    />
                </button>
            </div>
        );
    }

    return <Plugins plugins={installedPlugins}/>;
};

InstalledPlugins.propTypes = {
    installedPlugins: PropTypes.array.isRequired,
};

// MarketplaceModal is the plugin marketplace.
export class MarketplaceModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        plugins: PropTypes.array.isRequired,
        installedPlugins: PropTypes.array.isRequired,
        siteURL: PropTypes.string.isRequired,
        pluginStatuses: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            closeModal: PropTypes.func.isRequired,
            fetchPlugins: PropTypes.func.isRequired,
            filterPlugins: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            tabKey: MarketplaceTabs.ALL_PLUGINS,
            loading: true,
            serverError: null,
            filter: '',
        };
    }

    componentDidMount() {
        trackEvent('plugins', 'ui_marketplace_opened');

        this.fetchPlugins();
    }

    componentDidUpdate(prevProps) {
        // Automatically refresh the component when a plugin is installed or uninstalled.
        if (this.props.pluginStatuses !== prevProps.pluginStatuses) {
            this.fetchPlugins();
        }
    }

    fetchPlugins = async () => {
        const {error} = await this.props.actions.fetchPlugins();

        this.setState({loading: false, serverError: error});
    }

    close = () => {
        trackEvent('plugins', 'ui_marketplace_closed');
        this.props.actions.closeModal();
    }

    changeTab = (tabKey) => {
        this.setState({tabKey});
    }

    onInput = () => {
        this.setState({filter: this.refs.filter.value});

        this.debouncedSearch();
    }

    handleClearSearch = () => {
        this.refs.filter.value = '';
        this.setState({filter: this.refs.filter.value}, this.doSearch);
    }

    doSearch = async () => {
        trackEvent('plugins', 'ui_marketplace_search');

        const {error} = await this.props.actions.filterPlugins(this.state.filter);

        this.setState({serverError: error});
    }

    debouncedSearch = debounce(this.doSearch, SEARCH_TIMEOUT_MILLISECONDS);

    render() {
        const searchClearTooltip = (
            <Tooltip id='searchClearTooltip'>
                <FormattedMessage
                    id='search_bar.clear'
                    defaultMessage='Clear search query'
                />
            </Tooltip>
        );

        const input = (
            <div className='filter-row filter-row--full'>
                <div className='col-sm-12'>
                    <QuickInput
                        id='searchMarketplaceTextbox'
                        ref='filter'
                        className='form-control filter-textbox search_input'
                        placeholder={{id: t('marketplace_modal.search'), defaultMessage: 'Search Plugins'}}
                        inputComponent={LocalizedInput}
                        onInput={this.onInput}
                        value={this.state.filter}
                    />
                    {this.state.filter && this.state.filter.trim() !== '' &&
                        <div
                            id='searchClearButton'
                            className='sidebar__search-clear visible'
                            onClick={this.handleClearSearch}
                        >
                            <OverlayTrigger
                                delayShow={Constants.OVERLAY_TIME_DELAY}
                                placement='bottom'
                                overlay={searchClearTooltip}
                            >
                                <span
                                    className='sidebar__search-clear-x'
                                    aria-hidden='true'
                                >
                                    {'×'}
                                </span>
                            </OverlayTrigger>
                        </div>
                    }
                </div>
            </div>
        );

        let errorBanner = null;
        if (this.state.serverError) {
            errorBanner = (
                <div
                    className='error-bar'
                    id='error_bar'
                >
                    <FormattedMarkdownMessage
                        id='app.plugin.marketplace_plugins.app_error'
                        defaultMessage='Error connecting to the marketplace server. Please check your settings in the [System Console]({siteURL}/admin_console/plugins/plugin_management).'
                        values={{siteURL: this.props.siteURL}}
                    />
                </div>
            );
        }

        return (
            <RootPortal>
                <FullScreenModal
                    show={this.props.show}
                    onClose={this.close}
                >
                    {errorBanner}
                    <div
                        className='modal-marketplace'
                        id='modal_marketplace'
                    >
                        <h1>
                            <strong>
                                <FormattedMessage
                                    id='marketplace_modal.title'
                                    defaultMessage='Plugin Marketplace'
                                />
                            </strong>
                        </h1>
                        {input}
                        <Tabs
                            id='marketplaceTabs'
                            className='tabs'
                            defaultActiveKey='allPlugins'
                            activeKey={this.state.tabKey}
                            onSelect={this.changeTab}
                            unmountOnExit={true}
                        >
                            <Tab
                                eventKey={MarketplaceTabs.ALL_PLUGINS}
                                title={localizeMessage('marketplace_modal.tabs.all_plugins', 'All Plugins')}
                            >
                                {this.state.loading ? <LoadingScreen/> : <AllPlugins plugins={this.props.plugins}/>}
                            </Tab>
                            <Tab
                                eventKey={MarketplaceTabs.INSTALLED_PLUGINS}
                                title={localizeMessage('marketplace_modal.tabs.installed_plugins', 'Installed') + ` (${this.props.installedPlugins.length})`}
                            >
                                <InstalledPlugins installedPlugins={this.props.installedPlugins}/>
                            </Tab>
                        </Tabs>
                    </div>
                </FullScreenModal>
            </RootPortal>
        );
    }
}
