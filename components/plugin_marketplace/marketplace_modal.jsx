// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import {Tabs, Tab} from 'react-bootstrap';

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

import MarketplaceItem from './marketplace_item';

import './marketplace_modal.scss';

const MarketplaceTabs = {
    ALL_PLUGINS: 'allPlugins',
    INSTALLED_PLUGINS: 'installed',
};

const SEARCH_TIMEOUT_MILLISECONDS = 200;

export default class MarketplaceModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        installedPlugins: PropTypes.array.isRequired,
        marketplacePlugins: PropTypes.array.isRequired,
        siteURL: PropTypes.string.isRequired,
        pluginStatuses: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            closeModal: PropTypes.func.isRequired,
            getMarketplacePlugins: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            tabKey: MarketplaceTabs.ALL_PLUGINS,
            loading: true,
            serverError: null,
        };
    }

    componentDidMount() {
        trackEvent('plugins', 'ui_marketplace_opened');

        this.getMarketplacePlugins();
    }

    componentDidUpdate(prevProps) {
        if (!isEqual(this.props.pluginStatuses, prevProps.pluginStatuses)) {
            this.getMarketplacePlugins();
        }
    }

    getMarketplacePlugins = async () => {
        const filter = this.refs.filter ? this.refs.filter.value : null;
        const {error} = await this.props.actions.getMarketplacePlugins(filter);

        this.setState({loading: false, serverError: error});
    }

    handleSelect = (key) => {
        this.setState({tabKey: key});
    }

    close = () => {
        trackEvent('plugins', 'ui_marketplace_closed');
        this.props.actions.closeModal();
    }

    changeTab = (tabKey) => {
        this.setState({tabKey});
    }

    trackSearch = () => {
        trackEvent('plugins', 'ui_marketplace_search');
    }

    doSearch = () => {
        this.trackSearch();
        this.getMarketplacePlugins();
    }

    getPluginsListContent = (pluginsArray, installedList) => {
        if (pluginsArray.length === 0) {
            let noPluginsMessage = (
                <FormattedMessage
                    id='marketplace_modal.no_plugins'
                    defaultMessage='There are no plugins available at this time.'
                />);
            if (installedList) {
                noPluginsMessage = (
                    <FormattedMessage
                        id='marketplace_modal.no_plugins_installed'
                        defaultMessage='You do not have any plugins installed.'
                    />);
            }

            let installLink = null;
            if (installedList) {
                installLink = (
                    <button
                        className='margin-top x3 style--none color--link'
                        onClick={() => this.changeTab(MarketplaceTabs.ALL_PLUGINS)}
                    >
                        <FormattedMessage
                            id='marketplace_modal.install_plugins'
                            defaultMessage='Install Plugins'
                        />
                    </button>
                );
            }

            return (<div className='no_plugins_div'>
                <br/>
                <PluginIcon className='icon__plugin'/>
                <div className='margin-top x2 light'>
                    {noPluginsMessage}
                </div>
                {installLink}
            </div>);
        }

        return (<div className='more-modal__list'>
            {
                pluginsArray.map((p) => {
                    return (
                        <MarketplaceItem
                            key={p.manifest.id}
                            id={p.manifest.id}
                            name={p.manifest.name}
                            description={p.manifest.description}
                            version={p.manifest.version}
                            isPrepackaged={false}
                            downloadUrl={p.download_url}
                            homepageUrl={p.homepage_url}
                            iconData={p.icon_data}
                            installed={p.installed_version !== ''}
                            onConfigure={this.close}
                            onInstalled={this.getMarketplacePlugins}
                        />);
                })
            }
        </div>);
    }

    render() {
        const input = (
            <div className='filter-row filter-row--full'>
                <div className='col-sm-12'>
                    <QuickInput
                        id='searchMarketplaceTextbox'
                        ref='filter'
                        className='form-control filter-textbox search_input'
                        placeholder={{id: t('marketplace_modal.search'), defaultMessage: 'Search Plugins'}}
                        inputComponent={LocalizedInput}
                        onInput={debounce(this.doSearch, SEARCH_TIMEOUT_MILLISECONDS)}
                    />
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
                    show={Boolean(this.props.show)}
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
                            onSelect={this.handleSelect}
                            unmountOnExit={true}
                        >
                            <Tab
                                eventKey={MarketplaceTabs.ALL_PLUGINS}
                                title={localizeMessage('marketplace_modal.tabs.all_plugins', 'All Plugins')}
                            >
                                {this.state.loading ?
                                    <LoadingScreen/> : (
                                        this.getPluginsListContent(this.props.marketplacePlugins, false)
                                    )
                                }
                            </Tab>
                            <Tab
                                eventKey={MarketplaceTabs.INSTALLED_PLUGINS}
                                title={localizeMessage('marketplace_modal.tabs.installed_plugins', `Installed (${this.props.installedPlugins.length})`)}
                            >
                                {this.getPluginsListContent(this.props.installedPlugins, true)}
                            </Tab>
                        </Tabs>
                    </div>
                </FullScreenModal>
            </RootPortal>
        );
    }
}
