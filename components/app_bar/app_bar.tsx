// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {AppBinding} from 'mattermost-redux/types/apps';
import {Channel} from 'mattermost-redux/types/channels';
import {Theme} from 'mattermost-redux/types/themes';

import {PluginComponent} from 'types/store/plugins';

import AppBarBinding from './app_bar_binding';

import './app_bar.scss';

export type Props = {
    channelHeaderComponents: PluginComponent[];
    appBarBindings: AppBinding[];
    theme: Theme;
    channel: Channel;
    activePluginId?: string;

    show: boolean;
}

export default function AppBar(props: Props) {
    if (!props.show) {
        return null;
    }

    const channelHeaderComponents = props.channelHeaderComponents.map((component) => {
        const isComponentActive = component.pluginId === props.activePluginId;
        return (
            <div
                key={component.id}
                aria-label={component.tooltipText || component.pluginId}
                className={classNames('app-bar-icon', {'active-rhs-plugin': isComponentActive})}
                onClick={() => {
                    component.action?.(props.channel);
                }}
            >
                {component.icon}
            </div>
        );
    });

    const appBindingComponents = props.appBarBindings.map((binding) => (
        <AppBarBinding
            key={binding.app_id}
            binding={binding}
        />
    ));

    return (
        <div className='app-bar'>
            {channelHeaderComponents}
            {appBindingComponents}
        </div>
    );
}

AppBar.defaultProps = {
    channelHeaderComponents: [],
    appBarBindings: [],
}
