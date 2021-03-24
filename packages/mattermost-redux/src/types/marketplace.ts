// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.
import {PluginManifest} from './plugins';
import {AppManifest} from './apps';

export type MarketplaceLabel = {
    name: string;
    description?: string;
    url?: string;
    color?: string;
}

export enum HostingType {
    OnPrem = 'on-prem',
    Cloud = 'cloud',
}

export enum AuthorType {
    Mattermost = 'mattermost',
    Partner = 'partner',
    Community = 'community',
}

export enum ReleaseStage {
    Production = 'production',
    Beta = 'beta',
    Experimental = 'experimental',
}

interface MarketplaceBaseItem {
    labels?: MarketplaceLabel[];
    hosting?: HostingType;
    author_type: AuthorType;
    release_stage: ReleaseStage;
    enterprise: boolean;
}

export interface MarketplacePlugin extends MarketplaceBaseItem {
    manifest: PluginManifest;
    icon_data?: string;
    homepage_url?: string;
    download_url?: string;
    release_notes_url?: string;
    installed_version?: string;
}

export interface MarketplaceApp extends MarketplaceBaseItem {
    manifest: AppManifest;
    installed: boolean;
}
