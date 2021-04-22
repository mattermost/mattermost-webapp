// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// TODO remove
type Plugin = {
    id: string;
    name: string;
    description?: string;
    homepage_url?: string;
    support_url?: string;
    release_notes_url?: string;
    icon_path?: string;
    version: string;
    min_server_version?: string;
    server?: PluginManifestServer;
    backend?: PluginManifestServer;
    webapp?: PluginManifestWebapp;
    settings_schema?: PluginSettingsSchema;
    props?: Record<string, any>;
};

// TODO remove
export type PluginManifest = Plugin;

export type PluginRedux = PluginManifest & {active: boolean};

// TODO remove
export type PluginManifestServer = {
    executables?: {
        'linux-amd64'?: string;
        'darwin-amd64'?: string;
        'windows-amd64'?: string;
    };
    executable: string;
};

// TODO remove
export type PluginManifestWebapp = {
    bundle_path: string;
};

// TODO remove
export type PluginSettingsSchema = {
    header: string;
    footer: string;
    settings: PluginSetting[];
};

// TODO remove
export type PluginSetting = {
    key: string;
    display_name: string;
    type: string;
    help_text: string;
    regenerate_help_text?: string;
    placeholder: string;
    default: any;
    options?: PluginSettingOption[];
};

// TODO remove
export type PluginSettingOption = {
    display_name: string;
    value: string;
};

// TODO remove
export type PluginsResponse = {
    active: PluginManifest[];
    inactive: PluginManifest[];
};

// TODO remove
export type PluginStatus = {
    plugin_id: string;
    cluster_id: string;
    plugin_path: string;
    state: number;
    name: string;
    description: string;
    version: string;
};

type PluginInstance = {
    cluster_id: string;
    version: string;
    state: number;
}

export type PluginStatusRedux = {
    id: string;
    name: string;
    description: string;
    version: string;
    active: boolean;
    state: number;
    instances: PluginInstance[];
}

// TODO remove
export type ClientPluginManifest = {
    id: string;
    min_server_version?: string;
    version: string;
    webapp: {
        bundle_path: string;
    };
}

export type MarketplaceLabel = { // TODO remove this in favour of the definition in types/marketplace after the mattermost-redux migration
    name: string;
    description?: string;
    url?: string;
    color?: string;
}

export enum HostingType { // TODO remove this in favour of the definition in types/marketplace after the mattermost-redux migration
    OnPrem = 'on-prem',
    Cloud = 'cloud',
}

export enum AuthorType { // TODO remove this in favour of the definition in types/marketplace after the mattermost-redux migration
    Mattermost = 'mattermost',
    Partner = 'partner',
    Community = 'community',
}

export enum ReleaseStage { // TODO remove this in favour of the definition in types/marketplace after the mattermost-redux migration
    Production = 'production',
    Beta = 'beta',
    Experimental = 'experimental',
}

export type MarketplacePlugin = { // TODO remove this in favour of the definition in types/marketplace after the mattermost-redux migration
    homepage_url?: string;
    icon_data?: string;
    download_url?: string;
    release_notes_url?: string;
    labels?: MarketplaceLabel[];
    hosting?: HostingType;
    author_type: AuthorType;
    release_stage: ReleaseStage;
    enterprise: boolean;
    manifest: PluginManifest;
    installed_version?: string;
}
