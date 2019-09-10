// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Tabs, Tab} from 'react-bootstrap';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';
import QuickInput from 'components/quick_input';
import LocalizedInput from 'components/localized_input/localized_input';
import PluginIcon from 'components/widgets/icons/plugin_icon.jsx';

import {t} from 'utils/i18n';
import {localizeMessage} from 'utils/utils';
import * as Markdown from 'utils/markdown';

import MarketplaceItem from './marketplace_item';

import './marketplace_modal.scss';

const MarketplaceTabs = {
    ALL_PLUGINS: 'allPlugins',
    INSTALLED_PLUGINS: 'installed',
};

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
            loading: true,
        };
    }

    componentWillMount() {
        this.getMarketplacePlugins();
    }

    getMarketplacePlugins = async (filter) => {
        await this.props.actions.getMarketplacePlugins(filter);

        this.setState({loading: false});
    }

    handleSelect = (key) => {
        this.setState({tabKey: key});
    }

    close = () => {
        this.props.actions.closeModal();
    }

    changeTab = (tabKey) => {
        this.setState({tabKey});
    }

    doSearch = () => {
        const filter = this.refs.filter.value;
        this.setState({loading: true});

        this.getMarketplacePlugins(filter);
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
                            key={p.Manifest.id}
                            id={p.Manifest.id}
                            name={p.Manifest.name}
                            description={p.Manifest.description}
                            version={p.Manifest.version}
                            isPrepackaged={false}
                            downloadUrl={p.DownloadURL}
                            signatureUrl={p.SignatureURL}
                            homepageUrl={p.HomepageURL}
                            installed={p.InstalledVersion !== ''}
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
                                    defaultMessage='Plugins Marketplace'
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
                                {this.getPluginsListContent(this.props.marketplacePlugins, false)}
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
