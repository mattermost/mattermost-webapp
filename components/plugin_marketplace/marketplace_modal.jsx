// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import debounce from 'lodash/debounce';
import {Tabs, Tab} from 'react-bootstrap';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';
import QuickInput from 'components/quick_input';
import LocalizedInput from 'components/localized_input/localized_input';
import PluginIcon from 'components/widgets/icons/plugin_icon.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {t} from 'utils/i18n';
import {localizeMessage} from 'utils/utils';
import * as Markdown from 'utils/markdown';

import MarketplaceItem from './marketplace_item';

import './marketplace_modal.scss';

const MarketplaceTabs = {
    ALL_PLUGINS: 'allPlugins',
    INSTALLED_PLUGINS: 'installed',
};

const TRACK_SEARCH_WAIT = 1000;

export default class MarketplaceModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        installedPlugins: PropTypes.array.isRequired,
        marketplacePlugins: PropTypes.array.isRequired,
        serverError: PropTypes.object,
        actions: PropTypes.shape({
            closeModal: PropTypes.func.isRequired,
            getMarketplacePlugins: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            tabKey: MarketplaceTabs.ALL_PLUGINS,
            loading: false,
        };
    }

    componentWillMount() {
        this.setState({loading: true});

        this.getMarketplacePlugins();
    }

    componentDidMount() {
        trackEvent('plugins', 'ui_marketplace_opened');
    }

    getMarketplacePlugins = async () => {
        const filter = this.refs.filter ? this.refs.filter.value : null;
        await this.props.actions.getMarketplacePlugins(filter);

        this.setState({loading: false});
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
        debounce(this.trackSearch, TRACK_SEARCH_WAIT);

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

            return (<div className='no_plugins_div'>
                <br/>
                <PluginIcon className='icon__plugin'/>
                <br/>
                <br/>
                {noPluginsMessage}
                <br/>
                <br/>
                {installedList ? (
                    <a onClick={() => this.changeTab(MarketplaceTabs.ALL_PLUGINS)}>
                        <FormattedMessage
                            id='marketplace_modal.install_plugins'
                            defaultMessage='Install Plugins'
                        />
                    </a>
                ) : null
                }
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
                        onInput={this.doSearch}
                    />
                </div>
            </div>
        );

        let errorBanner = null;
        if (this.props.serverError) {
            errorBanner = (
                <div
                    className='error-bar'
                    dangerouslySetInnerHTML={{__html: Markdown.format(localizeMessage('app.plugin.marketplace_plugins.app_error',
                        'Error connecting to the marketplace server. Please check your settings in the [System Console](/admin_console/plugins/plugin_management).'))}}
                />
            );
        }

        return (
            <RootPortal>
                <FullScreenModal
                    show={Boolean(this.props.show)}
                    onClose={this.close}
                >
                    {errorBanner}
                    <div className='modal-marketplace'>
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
