// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {TIconGlyph} from '@mattermost/compass-components/foundations/icon';

import {ClientPluginManifest} from 'mattermost-redux/types/plugins';
import {PluginAnalyticsRow} from 'mattermost-redux/types/admin';
import {FileInfo} from 'mattermost-redux/types/files';
import {Post, PostEmbed} from 'mattermost-redux/types/posts';
import {IDMappedObjects} from 'mattermost-redux/types/utilities';

export type PluginSiteStatsHandler = () => Promise<Record<string, PluginAnalyticsRow>>;

export type PluginsState = {
    plugins: IDMappedObjects<ClientPluginManifest>;

    components: {
        Product: ProductComponent[];
        CallButton: PluginComponent[];
        PostDropdownMenu: PluginComponent[];
        FilePreview: PluginComponent[];
        MainMenu: PluginComponent[];
        LinkTooltip: PluginComponent[];
        RightHandSidebarComponent: PluginComponent[];
        ChannelHeaderButton: PluginComponent[];
        MobileChannelHeaderButton: PluginComponent[];
        AppBar: PluginComponent[];
        UserGuideDropdownItem: PluginComponent[];
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
    siteStatsHandlers: {
        [pluginId: string]: PluginSiteStatsHandler;
    };
};

export type Menu = {
    id: string;
    parentMenuId?: string;
    text?: React.ReactElement|string;
    selectedValueText?: string;
    subMenu?: Menu[];
    filter?: (id?: string) => boolean;
    action?: (...args: any) => void;
    icon?: React.ReactElement;
    direction?: 'left' | 'right';
    isHeader?: boolean;
}

export type PluginComponent = {
    id: string;
    pluginId: string;
    component?: React.ComponentType;
    subMenu?: Menu[];
    text?: string;
    dropdownText?: string;
    tooltipText?: string;
    button?: React.ReactElement;
    dropdownButton?: React.ReactElement;
    icon?: React.ReactElement;
    iconUrl?: string;
    mobileIcon?: React.ReactElement;
    filter?: (id: string) => boolean;
    action?: (...args: any) => void; // TODO Add more concrete types?
};

export type FilePreviewComponent = {
    id: string;
    pluginId: string;
    override: (fileInfo: FileInfo, post?: Post) => boolean;
    component: React.ComponentType<{fileInfo: FileInfo; post?: Post}>;
}

export type FileDropdownPluginComponent = {
    id: string;
    pluginId: string;
    text: string | React.ReactElement;
    match: (fileInfo: FileInfo) => boolean;
    action: (fileInfo: FileInfo) => void;
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

export type ProductComponent = {
    id: string;
    pluginId: string;
    switcherIcon: TIconGlyph;
    switcherText: string;
    baseURL: string;
    switcherLinkURL: string;
    mainComponent: React.ComponentType;
    headerCentreComponent?: React.ComponentType;
    headerRightComponent?: React.ComponentType;
    showTeamSidebar: boolean;
};
