// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {appBarEnabled, makeAppBindingsSelector} from 'mattermost-redux/selectors/entities/apps';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';

import {getChannelHeaderPluginComponents} from 'selectors/plugins';

import AppBarPluginComponent from './app_bar_plugin_component';
import AppBarBinding from './app_bar_binding';

import './app_bar.scss';

const getChannelHeaderBindings = makeAppBindingsSelector(AppBindingLocations.CHANNEL_HEADER_ICON);

export default function AppBar() {
    const channelHeaderPluginComponents = useSelector(getChannelHeaderPluginComponents);
    const channelHeaderAppBindings = useSelector(getChannelHeaderBindings);

    const enabled = useSelector(appBarEnabled);

    if (!enabled) {
        return null;
    }

    return (
        <div className={'app-bar'}>
            {channelHeaderPluginComponents.map((component) => (
                <AppBarPluginComponent
                    key={component.id}
                    component={component}
                />
            ))}
            {channelHeaderAppBindings.map((binding) => (
                <AppBarBinding
                    key={`${binding.app_id}_${binding.label}`}
                    binding={binding}
                />
            ))}
        </div>
    );
}
