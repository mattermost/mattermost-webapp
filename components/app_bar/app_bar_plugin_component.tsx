// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import semver from 'semver';
import classNames from 'classnames';

import {OverlayTrigger, Tooltip} from 'react-bootstrap/lib';

import {MarketplacePlugin} from 'mattermost-redux/types/marketplace';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {getInstalledListing} from 'selectors/views/marketplace';
import {getActivePluginId} from 'selectors/rhs';

import {PluginComponent} from 'types/store/plugins';
import Constants from 'utils/constants';

type PluginComponentProps = {
    component: PluginComponent;
}

const AppBarPluginComponent = (props: PluginComponentProps) => {
    const {component} = props;

    const marketplaceListing = useSelector(getInstalledListing);
    const channel = useSelector(getCurrentChannel);
    const activePluginId = useSelector(getActivePluginId);

    const getMarketplaceEntryForPlugin = (pluginId: string): MarketplacePlugin | undefined => {
        let latestEntry: MarketplacePlugin | undefined;
        for (const entry of marketplaceListing) {
            const pluginEntry = entry as MarketplacePlugin;
            if (pluginEntry.manifest.id === pluginId && pluginEntry.icon_data) {
                if (!latestEntry || semver.gte(pluginEntry.manifest.version, latestEntry.manifest.version)) {
                    latestEntry = pluginEntry;
                }
            }
        }

        return latestEntry;
    };

    const getIconForPluginComponent = (component: PluginComponent): React.ReactNode => {
        const entry = getMarketplaceEntryForPlugin(component.pluginId);
        if (entry) {
            return (
                <div className={'app-bar__icon-inner'}>
                    <img src={entry.icon_data} />
                </div>
            );
        }

        return component.icon;
    };

    const getPluginDisplayName = (component: PluginComponent): React.ReactNode => {
        const text = component.tooltipText || component.text;
        if (text) {
            return text;
        }

        const entry = getMarketplaceEntryForPlugin(component.pluginId);
        if (entry) {
            return entry.manifest.name;
        }

        return component.pluginId;
    };

    const label = getPluginDisplayName(component);
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
                    className={classNames('app-bar__icon', { 'app-bar__icon--active': component.pluginId === activePluginId })}
                    onClick={() => {
                        component.action?.(channel);
                    }}
                >
                    {getIconForPluginComponent(component)}
                </div>
            </OverlayTrigger>
        </div>
    )
};

export default AppBarPluginComponent;
