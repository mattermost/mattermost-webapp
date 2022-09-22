// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {TIconGlyph} from '@mattermost/compass-components/foundations/icon';

import {ClientPluginManifest} from '@mattermost/types/plugins';
import {PluginAnalyticsRow} from '@mattermost/types/admin';
import {FileInfo} from '@mattermost/types/files';
import {Post, PostEmbed} from '@mattermost/types/posts';
import {IDMappedObjects} from '@mattermost/types/utilities';
import {TopBoardResponse} from '@mattermost/types/insights';

import {WebSocketClient} from '@mattermost/client';

import {GlobalState} from 'types/store';

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
        FilesWillUploadHook: PluginComponent[];
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
        [pluginId: string]: {
            [settingName: string]: AdminConsolePluginComponent;
        };
    };
    siteStatsHandlers: {
        [pluginId: string]: PluginSiteStatsHandler;
    };
    insightsHandlers: {
        [pluginId: string]: (timeRange: string, page: number, perPage: number, teamId: string, insightType: string) => Promise<TopBoardResponse>;
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
    shouldRender?: (state: GlobalState) => boolean;
};

export type FilesWillUploadHook = {
    hook: (files: File[], uploadFiles: (files: File[]) => void) => { message?: string; files?: File[] };
}

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
    component: React.ElementType;
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
    component: React.ComponentType<{ embed: PostEmbed; webSocketClient?: WebSocketClient }>;
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
