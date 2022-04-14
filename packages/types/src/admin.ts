// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Audit} from './audits';
import {Compliance} from './compliance';
import {AdminConfig, ClientLicense, EnvironmentConfig} from './config';
import {DataRetentionCustomPolicies} from './data_retention';
import {MixedUnlinkedGroupRedux} from './groups';
import {PluginRedux, PluginStatusRedux} from './plugins';
import {SamlCertificateStatus, SamlMetadataResponse} from './saml';
import {Team} from './teams';
import {UserAccessToken, UserProfile} from './users';
import {RelationOneToOne} from './utilities';

export type ConsoleAccess = {
    read: Record<string, boolean>;
    write: Record<string, boolean>;
}

export type AdminState = {
    logs: string[];
    audits: Record<string, Audit>;
    config: Partial<AdminConfig>;
    environmentConfig: Partial<EnvironmentConfig>;
    complianceReports: Record<string, Compliance>;
    ldapGroups: Record<string, MixedUnlinkedGroupRedux>;
    ldapGroupsCount: number;
    userAccessTokens: Record<string, UserAccessToken>;
    clusterInfo: ClusterInfo[];
    samlCertStatus?: SamlCertificateStatus;
    analytics?: Record<string, number | AnalyticsRow[]>;
    teamAnalytics?: RelationOneToOne<Team, Record<string, number | AnalyticsRow[]>>;
    userAccessTokensByUser?: RelationOneToOne<UserProfile, Record<string, UserAccessToken>>;
    plugins?: Record<string, PluginRedux>;
    pluginStatuses?: Record<string, PluginStatusRedux>;
    samlMetadataResponse?: SamlMetadataResponse;
    dataRetentionCustomPolicies: DataRetentionCustomPolicies;
    dataRetentionCustomPoliciesCount: number;
    prevTrialLicense: ClientLicense;
};

export type ClusterInfo = {
    id: string;
    version: string;
    config_hash: string;
    ipaddress: string;
    hostname: string;
};

export type AnalyticsRow = {
    name: string;
    value: number;
};

export type SchemaMigration = {
    version: number;
    name: string;
};
