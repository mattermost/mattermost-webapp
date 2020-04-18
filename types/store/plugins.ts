// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ClientPluginManifest} from 'mattermost-redux/types/plugins';
import {Post} from 'mattermost-redux/src/types/posts';
import {IDMappedObjects} from 'mattermost-redux/types/utilities';

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
    component: React.Component;
};

export type PostPluginComponent = {
    id: string;
    pluginId: string;
    type: string;
    component: React.ComponentType<{post: Post}>;
};

export type AdminConsolePluginComponent = {
    pluginId: string;
    key: string;
    component: React.Component;
    options: {
        showTitle: boolean;
    };
};
