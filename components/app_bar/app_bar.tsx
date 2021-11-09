// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import semver from 'semver';
import {OverlayTrigger, Tooltip} from 'react-bootstrap/lib';

import {AppBinding} from 'mattermost-redux/types/apps';
import {Channel} from 'mattermost-redux/types/channels';
import {MarketplaceApp, MarketplacePlugin} from 'mattermost-redux/types/marketplace';
import {Theme} from 'mattermost-redux/types/themes';

import {PluginComponent} from 'types/store/plugins';
import Constants from 'utils/constants';

import AppBarBinding from './app_bar_binding';

import './app_bar.scss';

export type Props = {
    channelHeaderPluginComponents: PluginComponent[];
    channelHeaderAppBindings: AppBinding[];
    theme: Theme;
    channel: Channel;
    marketplaceListing: Array<MarketplacePlugin | MarketplaceApp>;
    activePluginId?: string;
    actions: {
        fetchListing: (localOnly?: boolean) => Promise<{ data?: Array<MarketplacePlugin | MarketplaceApp> }>;
    };
}

type State = {
    loadedMarketplaceListing: boolean;
}

export default class AppBar extends React.PureComponent<Props> {
    static defaultProps: Partial<Props> = {
        channelHeaderPluginComponents: [],
        channelHeaderAppBindings: [],
        marketplaceListing: [],
    }

    state: State = {
        loadedMarketplaceListing: false,
    }

    componentDidMount() {
        this.getInstalledMarketPlaceListings();
    }

    getInstalledMarketPlaceListings = async () => {
        await this.props.actions.fetchListing(true);
        this.setState({loadedMarketplaceListing: true});
    }

    getIcon = (component: PluginComponent): React.ReactNode => {
        let latestEntry: MarketplacePlugin | undefined;
        for (const entry of this.props.marketplaceListing) {
            const pluginEntry = entry as MarketplacePlugin;
            if (pluginEntry.manifest.id === component.pluginId && pluginEntry.icon_data) {
                if (!latestEntry || semver.gte(pluginEntry.manifest.version, latestEntry.manifest.version)) {
                    latestEntry = pluginEntry;
                }
            }
        }

        if (!latestEntry) {
            return component.icon;
        }

        return (
            <img src={latestEntry.icon_data} />
        );
    }

    render() {
        return (
            <div
                className={classNames(['app-bar', { hidden: !this.state.loadedMarketplaceListing }])}
            >
                {this.props.channelHeaderPluginComponents.map((component) => {

                    const label = component.tooltipText || component.pluginId;
                    const buttonId = component.id;
                    const tooltip = (
                        <Tooltip
                            id='pluginTooltip'
                            className=''
                        >
                            <span>{label}</span>
                        </Tooltip>
                    );

                    return (
                        <div>
                            <OverlayTrigger
                                trigger={['hover']}
                                delayShow={Constants.OVERLAY_TIME_DELAY}
                                placement='bottom'
                                overlay={tooltip}
                            >
                                <div
                                    id={buttonId}
                                    aria-label={component.pluginId}
                                    className={classNames('app-bar-icon', {'active-rhs-plugin': component.pluginId === this.props.activePluginId})}
                                    // className={buttonClass || 'channel-header__icon'}
                                    onClick={() => {
                                        component.action?.(this.props.channel);
                                    }}
                                >
                                    {this.getIcon(component)}
                                </div>
                            </OverlayTrigger>
                        </div>
                    )
                })}
                {this.props.channelHeaderAppBindings.map((binding) => (
                    <AppBarBinding
                        key={`${binding.app_id}_${binding.label}`}
                        binding={binding}
                    />
                ))}
            </div>
        );
    }
}
