// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

declare const REMOTE_MODULES: Record<string, string>;

declare module 'focalboard' {
    import type {ProductPlugin} from 'plugins/products';

    export default class Plugin extends ProductPlugin {
        initialize(registry: PluginRegistry, store: Store): void;
        uninitialize(): void;
    }
}

declare module 'focalboard/manifest' {
    import type {PluginManifest} from '@mattermost/types/plugins';
    const module: PluginManifest;
    export default module;
}
