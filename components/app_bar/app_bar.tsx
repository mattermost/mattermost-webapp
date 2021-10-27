// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';
import classNames from 'classnames';
import semver from 'semver';

import {AppBinding} from 'mattermost-redux/types/apps';
import {Channel} from 'mattermost-redux/types/channels';
import {MarketplaceApp, MarketplacePlugin} from 'mattermost-redux/types/marketplace';
import {Theme} from 'mattermost-redux/types/themes';

import {PluginComponent} from 'types/store/plugins';

import AppBarBinding from './app_bar_binding';

import './app_bar.scss';

export type Props = {
    channelHeaderComponents: PluginComponent[];
    appBarBindings: AppBinding[];
    theme: Theme;
    channel: Channel;
    marketplaceListing: Array<MarketplacePlugin | MarketplaceApp>;
    activePluginId?: string;

    actions: {
        fetchListing: () => Promise<{ data?: Array<MarketplacePlugin | MarketplaceApp>}>;
    };
}

type State = {
    loadedMarketplaceListing: boolean;
}

export default class AppBar extends React.PureComponent<Props> {
    static defaultProps: Partial<Props> = {
        channelHeaderComponents: [],
        appBarBindings: [],
        marketplaceListing: [],
    }

    state: State = {
        loadedMarketplaceListing: false,
    }

    componentDidMount() {
        this.getMarketPlaceListings();
    }

    getMarketPlaceListings = async () => {
        await this.props.actions.fetchListing();
        this.setState({loadedMarketplaceListing: true});
    }

    getIcon = (component: PluginComponent): React.ReactNode => {
        let entry: MarketplacePlugin | undefined;
        for (const e of this.props.marketplaceListing) {
            const p = e as MarketplacePlugin;
            if (p.manifest.id === component.pluginId && p.icon_data) {
                if (!entry || semver.gte(p.manifest.version, entry.manifest.version)) {
                    entry = p;
                }
            }
        }

        if (!entry) {
            return component.icon;
        }

        return (
            <img src={entry.icon_data}/>
        );
    }

    render() {
        const style: CSSProperties = {};
        if (!this.state.loadedMarketplaceListing) {
            style.display = 'none';
        }

        return (
            <div
                className='app-bar'
                style={style}
            >
                {this.props.channelHeaderComponents.map((component) => (
                    <div
                        key={component.id}
                        className={classNames('app-bar-icon', {'active-rhs-plugin': component.pluginId === this.props.activePluginId})}
                        onClick={() => {
                            component.action?.(this.props.channel);
                        }}
                    >
                        {this.getIcon(component)}
                    </div>
                ))}
                {this.props.appBarBindings.map((binding) => (
                    <AppBarBinding
                        key={binding.app_id}
                        binding={binding}
                    />
                ))}
            </div>
        );
    }
}
