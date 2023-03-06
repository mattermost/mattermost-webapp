// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Browser APIs not yet supported by supported by two or more major browser engines are not included in official TypeScript definitions

interface Navigator extends Navigator {
    // App Badging API, currently Chromium-only
    setAppBadge: (contents?: Number) => Promise<void>;
}
