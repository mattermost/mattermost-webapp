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
import PluginIcon from 'components/svg/plugin_icon.jsx';

import {t} from 'utils/i18n';
import {localizeMessage} from 'utils/utils';
import {MarketplaceItemStates} from 'utils/constants';

import MarketplaceItem from './marketplace_item';

import './marketplace_modal.scss';

const MarketplaceTabs = {
    ALL_PLUGINS: 'allPlugins',
    INSTALLED_PLUGINS: 'installed',
};

export default class MarketplaceModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        installedPlugins: PropTypes.object.isRequired,
        marketplacePlugins: PropTypes.array.isRequired,
        actions: PropTypes.shape({
            closeModal: PropTypes.func.isRequired,
            getPlugins: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            tabKey: MarketplaceTabs.ALL_PLUGINS,
            loading: true,
            loadedPlugins: false,
        };

        this.props.actions.getPlugins().then(
            () => this.setState({loadedPlugins: true})
        );
    }

    componentDidMount() {
        if (this.state.loadedPlugins) {
            return;
        }

        //WIP : This will be replaced with getting the marketplace plugins
        this.props.actions.getPlugins().then(
            () => this.setState({loadedPlugins: true})
        );
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

    render() {
        //WIP: This will be replaced with only a list from the marketplace server
        const installedPluginsArray = [];
        Object.entries(this.props.installedPlugins).forEach(([, plugin]) => {
            installedPluginsArray.push(plugin);
        });

        //WIP: To add pagination section

        const input = (
            <div className='filter-row filter-row--full'>
                <div className='col-sm-12'>
                    <QuickInput
                        id='searchChannelsTextbox'
                        ref='filter'
                        className='form-control filter-textbox search_input'
                        placeholder={{id: t('marketplace_modal.search'), defaultMessage: 'Search Plugins'}}
                        inputComponent={LocalizedInput}
                        onInput={this.doSearch}
                    />
                </div>
            </div>
        );

        return (
            <RootPortal>
                <FullScreenModal
                    show={Boolean(this.props.show)}
                    onClose={this.close}
                >
                    <div className='MarketplaceModal'>
                        <h1>
                            <FormattedMessage
                                id='marketplace_modal.title'
                                defaultMessage='Plugins Marketplace'
                            />
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
                                <div className='more-modal__list'>
                                    {
                                        this.props.marketplacePlugins.length > 0 ?
                                            this.props.marketplacePlugins.map((p) => {
                                                return (
                                                    <MarketplaceItem
                                                        key={p.manifest.id}
                                                        id={p.manifest.id}
                                                        name={p.manifest.name}
                                                        description={p.manifest.description}
                                                        version={p.manifest.version}
                                                        isPrepackaged={false}
                                                        itemUrl={p.download_url}
                                                        itemState={MarketplaceItemStates.DOWNLOAD}
                                                        onConfigure={this.close}
                                                    />);
                                            }
                                            ) : (
                                                <div className='no_plugins_div'>
                                                    <br/>
                                                    <PluginIcon className='icon__plugin'/>
                                                    <br/>
                                                    <br/>
                                                    <FormattedMessage
                                                        id='marketplace_modal.no_plugins'
                                                        defaultMessage='There are no plugins available at this time.'
                                                    />
                                                    <br/>
                                                    <br/>
                                                </div>
                                            )
                                    }
                                </div>
                            </Tab>
                            <Tab
                                eventKey={MarketplaceTabs.INSTALLED_PLUGINS}
                                title={localizeMessage('marketplace_modal.tabs.installed_plugins', `Installed (${installedPluginsArray.length})`)}
                            >
                                <div className='more-modal__list'>
                                    {
                                        installedPluginsArray.length > 0 ?
                                            installedPluginsArray.map((p) => {
                                                return (
                                                    <MarketplaceItem
                                                        key={p.id}
                                                        id={p.id}
                                                        name={p.name}
                                                        description={p.description}
                                                        version={p.version}
                                                        isPrepackaged={false}
                                                        itemUrl={p.download_url}
                                                        itemState={MarketplaceItemStates.CONFIGURE}
                                                        onConfigure={this.close}
                                                    />);
                                            }
                                            ) : (
                                                <div className='no_plugins_div'>
                                                    <br/>
                                                    <PluginIcon className='icon__plugin'/>
                                                    <br/>
                                                    <br/>
                                                    <FormattedMessage
                                                        id='marketplace_modal.no_plugins_installed'
                                                        defaultMessage='You do not have any plugins installed.'
                                                    />
                                                    <br/>
                                                    <br/>
                                                    <a onClick={() => this.changeTab(MarketplaceTabs.ALL_PLUGINS)}>
                                                        <FormattedMessage
                                                            id='marketplace_modal.install_plugins'
                                                            defaultMessage='Install Plugins'
                                                        />
                                                    </a>
                                                </div>
                                            )
                                    }
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </FullScreenModal>
            </RootPortal>
        );
    }
}
