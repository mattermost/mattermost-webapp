// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import semver from 'semver';
import classNames from 'classnames';

import {OverlayTrigger, Tooltip} from 'react-bootstrap/lib';

import {MarketplacePlugin} from 'mattermost-redux/types/marketplace';
import {makeAppBindingsSelector} from 'mattermost-redux/selectors/entities/apps';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {fetchListing} from 'actions/marketplace';
import {getInstalledListing} from 'selectors/views/marketplace';
import {getActivePluginId} from 'selectors/rhs';
import {getChannelHeaderPluginComponents} from 'selectors/plugins';

import {PluginComponent} from 'types/store/plugins';
import Constants from 'utils/constants';

import AppBarBinding from './app_bar_binding';

import './app_bar.scss';

const getChannelHeaderBindings = makeAppBindingsSelector(AppBindingLocations.CHANNEL_HEADER_ICON);

export default function AppBar() {
    const [loadedMarketplace, setLoadedMarketplace] = useState(false);

    const marketplaceListing = useSelector(getInstalledListing);
    const channelHeaderPluginComponents = useSelector(getChannelHeaderPluginComponents);
    const channelHeaderAppBindings = useSelector(getChannelHeaderBindings);

    const channel = useSelector(getCurrentChannel);

    const activePluginId = useSelector(getActivePluginId);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchListing(true)).then(() => {
            setLoadedMarketplace(true);
        });
    }, []);

    const getIcon = (component: PluginComponent): React.ReactNode => {
        let latestEntry: MarketplacePlugin | undefined;
        for (const entry of marketplaceListing) {
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
    };


    return (
        <div
            className={classNames(['app-bar', { hidden: !loadedMarketplace }])}
        >
            {channelHeaderPluginComponents.map((component) => {
                // this should be its own function component in another file
                // it will use useSelector to get the marketplace listings for the icon

                const label = component.tooltipText || component.pluginId;
                const buttonId = component.id;
                const tooltip = (
                    <Tooltip id={'pluginTooltip-' + buttonId}>
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
                                className={classNames('app-bar-icon', { 'active-rhs-plugin': component.pluginId === activePluginId })}
                                // className={buttonClass || 'channel-header__icon'}
                                onClick={() => {
                                    component.action?.(channel);
                                }}
                            >
                                {getIcon(component)}
                            </div>
                        </OverlayTrigger>
                    </div>
                )
            })}
            {channelHeaderAppBindings.map((binding) => (
                <AppBarBinding
                    key={`${binding.app_id}_${binding.label}`}
                    binding={binding}
                />
            ))}
        </div>
    );
}

AppBar.defaultProps = {
    channelHeaderPluginComponents: [],
    channelHeaderAppBindings: [],
    marketplaceListing: [],
};
