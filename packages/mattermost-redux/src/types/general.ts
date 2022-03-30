// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ClientConfig, ClientLicense, WarnMetricStatus} from './config';

export type GeneralState = {
    appState: boolean;
    credentials: any;
    config: Partial<ClientConfig>;
    dataRetentionPolicy: any;
    deviceToken: string;
    firstAdminVisitMarketplaceStatus: boolean;
    firstAdminCompleteSetup: boolean;
    license: ClientLicense;
    serverVersion: string;
    warnMetricsStatus: Record<string, WarnMetricStatus>;
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

export const isEnterpriseLicense = (license?: ClientLicense) => {
    switch (license?.SkuShortName) {
    case LicenseSkus.Enterprise:
    case LicenseSkus.E20:
        return true;
    }

    return false;
};

export const isNonEnterpriseLicense = (license?: ClientLicense) => !isEnterpriseLicense(license);
