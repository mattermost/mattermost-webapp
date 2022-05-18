// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type UsageState = {
    integrations: IntegrationsUsage;
}

export type IntegrationsUsage = {
    count: number;
}
