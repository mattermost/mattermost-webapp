// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Audit} from './audits';
import {Compliance} from './compliance';
import {AdminConfig, EnvironmentConfig} from './config';
import {DataRetentionCustomPolicies} from './data_retention';
import {MixedUnlinkedGroupRedux} from './groups';
import {PluginRedux, PluginStatusRedux} from './plugins';
import {SamlCertificateStatus, SamlMetadataResponse} from './saml';
import {Team} from './teams';
import {UserAccessToken, UserProfile} from './users';
import {Dictionary, RelationOneToOne} from './utilities';

export type ConsoleAccess = {
    read: Record<string, boolean>;
    write: Record<string, boolean>;
}

export type AdminState = {
    logs: string[];
    audits: Dictionary<Audit>;
    config: Partial<AdminConfig>;
    environmentConfig: Partial<EnvironmentConfig>;
    complianceReports: Dictionary<Compliance>;
    ldapGroups: Dictionary<MixedUnlinkedGroupRedux>;
    ldapGroupsCount: number;
    userAccessTokens: Dictionary<UserAccessToken>;
    clusterInfo: ClusterInfo[];
    samlCertStatus?: SamlCertificateStatus;
    analytics?: Dictionary<number | AnalyticsRow[]>;
    teamAnalytics?: RelationOneToOne<Team, Dictionary<number | AnalyticsRow[]>>;
    userAccessTokensByUser?: RelationOneToOne<UserProfile, Dictionary<UserAccessToken>>;
    plugins?: Dictionary<PluginRedux>;
    pluginStatuses?: Dictionary<PluginStatusRedux>;
    samlMetadataResponse?: SamlMetadataResponse;
    dataRetentionCustomPolicies: DataRetentionCustomPolicies;
    dataRetentionCustomPoliciesCount: number;
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
