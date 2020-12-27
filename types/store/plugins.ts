// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ClientPluginManifest} from 'mattermost-redux/types/plugins';
import {PostEmbed} from 'mattermost-redux/types/posts';
import {IDMappedObjects} from 'mattermost-redux/types/utilities';
import React from 'react';

export type PluginsState = {
    plugins: IDMappedObjects<ClientPluginManifest>;

    components: {
        [componentName: string]: PluginComponent[];
    };

    postTypes: {
        [postType: string]: PostPluginComponent;
    };
    postCardTypes: {
        [postType: string]: PostPluginComponent;
    };

    adminConsoleReducers: {
        [pluginId: string]: any;
    };
    adminConsoleCustomComponents: {
        [pluginId: string]: AdminConsolePluginComponent;
    };
};

export type PluginComponent = {
    id: string;
    pluginId: string;
    component?: React.Component;
    subMenu?: any[]; // TODO Add more concrete type
    text?: string;
    dropdownText?: string;
    tooltipText?: string;
    icon?: React.ReactElement;
    filter?: (id: string) => boolean;
    action?: (...args: any) => void; // TODO Add more concrete types?
};

export type PostPluginComponent = {
    id: string;
    pluginId: string;
    type: string;
    component: React.Component;
};

export type AdminConsolePluginComponent = {
    pluginId: string;
    key: string;
    component: React.Component;
    options: {
        showTitle: boolean;
    };
};

export type PostWillRenderEmbedPluginComponent = {
    id: string;
    pluginId: string;
    component: React.ComponentType<{ embed: PostEmbed }>;
    match: (arg: PostEmbed) => boolean;
    toggleable: boolean;
}
