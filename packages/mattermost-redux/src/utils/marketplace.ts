// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MarketplaceApp, MarketplacePlugin} from 'mattermost-redux/types/marketplace';

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.
export function isPlugin(item: MarketplacePlugin | MarketplaceApp): item is MarketplacePlugin {
    return (item as MarketplacePlugin).manifest.id !== undefined;
}

export function getName(item: MarketplacePlugin | MarketplaceApp): string {
    if (isPlugin(item)) {
        return item.manifest.name;
    }
    return item.manifest.display_name;
}
