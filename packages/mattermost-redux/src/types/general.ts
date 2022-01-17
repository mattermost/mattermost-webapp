// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ClientConfig, ClientLicense, WarnMetricStatus} from './config';

import {Dictionary} from './utilities';

export type GeneralState = {
    appState: boolean;
    credentials: any;
    config: Partial<ClientConfig>;
    dataRetentionPolicy: any;
    deviceToken: string;
    firstAdminVisitMarketplaceStatus: boolean;
    license: ClientLicense;
    serverVersion: string;
    timezones: string[];
    warnMetricsStatus: Dictionary<WarnMetricStatus>;
};

export type SystemSetting = {
    name: string;
    value: string;
};

export enum LicenseSkus {
    E10 = 'E10',
    E20 = 'E20',
    Starter = 'starter',
    Professional = 'professional',
    Enterprise = 'enterprise',
}
