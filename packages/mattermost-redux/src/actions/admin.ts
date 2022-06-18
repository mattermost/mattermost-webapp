// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {AdminTypes} from 'mattermost-redux/action_types';
import {General} from '../constants';
import {Client4} from 'mattermost-redux/client';

import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {Compliance} from '@mattermost/types/compliance';
import {GroupSearchOpts} from '@mattermost/types/groups';
import {
    CreateDataRetentionCustomPolicy,
} from '@mattermost/types/data_retention';
import {
    TeamSearchOpts,
} from '@mattermost/types/teams';
import {
    ChannelSearchOpts,
} from '@mattermost/types/channels';

import {CompleteOnboardingRequest} from '@mattermost/types/setup';

import {bindClientFunc} from './helpers';

export function getLogs(page = 0, perPage: number = General.LOGS_PAGE_SIZE_DEFAULT): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getLogs,
        onSuccess: [AdminTypes.RECEIVED_LOGS],
        params: [
            page,
            perPage,
        ],
    });
}

export function getAudits(page = 0, perPage: number = General.PAGE_SIZE_DEFAULT): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getAudits,
        onSuccess: [AdminTypes.RECEIVED_AUDITS],
        params: [
            page,
            perPage,
        ],
    });
}

export function getConfig(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getConfig,
        onSuccess: [AdminTypes.RECEIVED_CONFIG],
    });
}

export function updateConfig(config: Record<string, any>): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.updateConfig,
        onSuccess: [AdminTypes.RECEIVED_CONFIG],
        params: [
            config,
        ],
    });
}

export function reloadConfig(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.reloadConfig,
    });
}

export function getEnvironmentConfig(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getEnvironmentConfig,
        onSuccess: [AdminTypes.RECEIVED_ENVIRONMENT_CONFIG],
    });
}

export function testEmail(config: any): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.testEmail,
        params: [
            config,
        ],
    });
}

export function testSiteURL(siteURL: string): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.testSiteURL,
        params: [
            siteURL,
        ],
    });
}

export function testS3Connection(config: any): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.testS3Connection,
        params: [
            config,
        ],
    });
}

export function invalidateCaches(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.invalidateCaches,
    });
}

export function recycleDatabase(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.recycleDatabase,
    });
}

export function createComplianceReport(job: Partial<Compliance>): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.createComplianceReport,
        onRequest: AdminTypes.CREATE_COMPLIANCE_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_COMPLIANCE_REPORT, AdminTypes.CREATE_COMPLIANCE_SUCCESS],
        onFailure: AdminTypes.CREATE_COMPLIANCE_FAILURE,
        params: [
            job,
        ],
    });
}

export function getComplianceReport(reportId: string): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getComplianceReport,
        onSuccess: [AdminTypes.RECEIVED_COMPLIANCE_REPORT],
        params: [
            reportId,
        ],
    });
}

export function getComplianceReports(page = 0, perPage: number = General.PAGE_SIZE_DEFAULT): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getComplianceReports,
        onSuccess: [AdminTypes.RECEIVED_COMPLIANCE_REPORTS],
        params: [
            page,
            perPage,
        ],
    });
}

export function uploadBrandImage(imageData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadBrandImage,
        params: [
            imageData,
        ],
    });
}

export function deleteBrandImage(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.deleteBrandImage,
    });
}

export function getClusterStatus(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getClusterStatus,
        onSuccess: [AdminTypes.RECEIVED_CLUSTER_STATUS],
    });
}

export function testLdap(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.testLdap,
    });
}

export function syncLdap(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.syncLdap,
    });
}

export function getLdapGroups(page = 0, perPage: number = General.PAGE_SIZE_MAXIMUM, opts: GroupSearchOpts = {q: ''}): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getLdapGroups,
        onSuccess: [AdminTypes.RECEIVED_LDAP_GROUPS],
        params: [
            page,
            perPage,
            opts,
        ],
    });
}

export function linkLdapGroup(key: string): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        let data;
        try {
            data = await Client4.linkLdapGroup(key);
        } catch (error) {
            dispatch({type: AdminTypes.LINK_LDAP_GROUP_FAILURE, error, data: key});

            throw error;
        }

        dispatch({
            type: AdminTypes.LINKED_LDAP_GROUP,
            data: {
                primary_key: key,
                name: data.display_name,
                mattermost_group_id: data.id,
                has_syncables: false,
            },
        });

        return {data: true};
    };
}

export function unlinkLdapGroup(key: string): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            await Client4.unlinkLdapGroup(key);
        } catch (error) {
            dispatch({type: AdminTypes.UNLINK_LDAP_GROUP_FAILURE, error, data: key});

            throw error;
        }

        dispatch({
            type: AdminTypes.UNLINKED_LDAP_GROUP,
            data: key,
        });

        return {data: true};
    };
}

export function getSamlCertificateStatus(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSamlCertificateStatus,
        onSuccess: [AdminTypes.RECEIVED_SAML_CERT_STATUS],
    });
}

export function uploadPublicSamlCertificate(fileData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadPublicSamlCertificate,
        params: [
            fileData,
        ],
    });
}

export function uploadPrivateSamlCertificate(fileData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadPrivateSamlCertificate,
        params: [
            fileData,
        ],
    });
}

export function uploadPublicLdapCertificate(fileData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadPublicLdapCertificate,
        params: [
            fileData,
        ],
    });
}

export function uploadPrivateLdapCertificate(fileData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadPrivateLdapCertificate,
        params: [
            fileData,
        ],
    });
}

export function uploadIdpSamlCertificate(fileData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadIdpSamlCertificate,
        params: [
            fileData,
        ],
    });
}

export function removePublicSamlCertificate(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.deletePublicSamlCertificate,
    });
}

export function removePrivateSamlCertificate(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.deletePrivateSamlCertificate,
    });
}

export function removePublicLdapCertificate(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.deletePublicLdapCertificate,
    });
}

export function removePrivateLdapCertificate(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.deletePrivateLdapCertificate,
    });
}

export function removeIdpSamlCertificate(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.deleteIdpSamlCertificate,
    });
}

export function testElasticsearch(config: any): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.testElasticsearch,
        params: [
            config,
        ],
    });
}

export function purgeElasticsearchIndexes(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.purgeElasticsearchIndexes,
    });
}

export function uploadLicense(fileData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadLicense,
        params: [
            fileData,
        ],
    });
}

export function removeLicense(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.removeLicense,
    });
}

export function getPrevTrialLicense(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getPrevTrialLicense,
        onSuccess: AdminTypes.PREV_TRIAL_LICENSE_SUCCESS,
    });
}

export function getAnalytics(name: string, teamId = ''): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        const data = await Client4.getAnalytics(name, teamId);

        if (teamId === '') {
            dispatch({type: AdminTypes.RECEIVED_SYSTEM_ANALYTICS, data, name});
        } else {
            dispatch({type: AdminTypes.RECEIVED_TEAM_ANALYTICS, data, name, teamId});
        }

        return {data};
    };
}

export function getStandardAnalytics(teamId = ''): ActionFunc {
    return getAnalytics('standard', teamId);
}

export function getAdvancedAnalytics(teamId = ''): ActionFunc {
    return getAnalytics('extra_counts', teamId);
}

export function getPostsPerDayAnalytics(teamId = ''): ActionFunc {
    return getAnalytics('post_counts_day', teamId);
}

export function getBotPostsPerDayAnalytics(teamId = ''): ActionFunc {
    return getAnalytics('bot_post_counts_day', teamId);
}

export function getUsersPerDayAnalytics(teamId = ''): ActionFunc {
    return getAnalytics('user_counts_with_posts_day', teamId);
}

export function uploadPlugin(fileData: File, force = false): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadPlugin,
        params: [fileData, force],
    });
}

export function installPluginFromUrl(url: string, force = false): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.installPluginFromUrl,
        params: [url, force],
    });
}

export function getPlugins(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getPlugins,
        onSuccess: [AdminTypes.RECEIVED_PLUGINS],
    });
}

export function getPluginStatuses(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getPluginStatuses,
        onSuccess: [AdminTypes.RECEIVED_PLUGIN_STATUSES],
    });
}

export function removePlugin(pluginId: string): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        await Client4.removePlugin(pluginId);

        dispatch(batchActions([
            {type: AdminTypes.REMOVED_PLUGIN, data: pluginId},
            {type: AdminTypes.DISABLED_PLUGIN, data: pluginId},
        ]));

        return {data: true};
    };
}

export function enablePlugin(pluginId: string): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        await Client4.enablePlugin(pluginId);

        dispatch({type: AdminTypes.ENABLED_PLUGIN, data: pluginId});

        return {data: true};
    };
}

export function disablePlugin(pluginId: string): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        dispatch({type: AdminTypes.DISABLE_PLUGIN_REQUEST, data: pluginId});

        await Client4.disablePlugin(pluginId);

        dispatch({type: AdminTypes.DISABLED_PLUGIN, data: pluginId});

        return {data: true};
    };
}

export function getSamlMetadataFromIdp(samlMetadataURL: string): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSamlMetadataFromIdp,
        onSuccess: AdminTypes.RECEIVED_SAML_METADATA_RESPONSE,
        params: [
            samlMetadataURL,
        ],
    });
}

export function setSamlIdpCertificateFromMetadata(certData: string): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.setSamlIdpCertificateFromMetadata,
        params: [
            certData,
        ],
    });
}

export function sendWarnMetricAck(warnMetricId: string, forceAck: boolean) {
    return async () => {
        Client4.trackEvent('api', 'api_request_send_metric_ack', {warnMetricId});
        await Client4.sendWarnMetricAck(warnMetricId, forceAck);
        return {data: true};
    };
}

export function getDataRetentionCustomPolicies(page = 0, perPage = 10): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getDataRetentionCustomPolicies,
        params: [page, perPage],
        onSuccess: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICIES,
        onFailure: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICIES,
    });
}

export function getDataRetentionCustomPolicy(id: string): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getDataRetentionCustomPolicy,
        params: [id],
        onSuccess: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY,
        onFailure: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY,
    });
}

export function deleteDataRetentionCustomPolicy(id: string): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            await Client4.deleteDataRetentionCustomPolicy(id);
        } catch (error) {
            dispatch(
                {
                    type: AdminTypes.DELETE_DATA_RETENTION_CUSTOM_POLICY_FAILURE,
                    error,
                },
            );

            throw error;
        }
        const data = {
            id,
        };
        dispatch(
            {type: AdminTypes.DELETE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS, data},
        );

        return {data};
    };
}

export function getDataRetentionCustomPolicyTeams(id: string, page = 0, perPage: number = General.TEAMS_CHUNK_SIZE): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getDataRetentionCustomPolicyTeams,
        params: [id, page, perPage],
        onSuccess: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY_TEAMS,
        onFailure: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY_TEAMS,
    });
}

export function getDataRetentionCustomPolicyChannels(id: string, page = 0, perPage: number = General.TEAMS_CHUNK_SIZE): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getDataRetentionCustomPolicyChannels,
        params: [id, page, perPage],
        onSuccess: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY_CHANNELS,
        onFailure: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY_CHANNELS,
    });
}

export function searchDataRetentionCustomPolicyTeams(id: string, term: string, opts: TeamSearchOpts): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.searchDataRetentionCustomPolicyTeams,
        params: [id, term, opts],
        onSuccess: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY_TEAMS_SEARCH,
        onFailure: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY_TEAMS_SEARCH,
    });
}

export function searchDataRetentionCustomPolicyChannels(id: string, term: string, opts: ChannelSearchOpts): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.searchDataRetentionCustomPolicyChannels,
        params: [id, term, opts],
        onSuccess: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY_CHANNELS_SEARCH,
        onFailure: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY_CHANNELS_SEARCH,
    });
}

export function createDataRetentionCustomPolicy(policy: CreateDataRetentionCustomPolicy): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.createDataRetentionPolicy,
        params: [policy],
        onSuccess: AdminTypes.CREATE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS,
    });
}

export function updateDataRetentionCustomPolicy(id: string, policy: CreateDataRetentionCustomPolicy): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.updateDataRetentionPolicy,
        params: [id, policy],
        onSuccess: AdminTypes.UPDATE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS,
    });
}

export function addDataRetentionCustomPolicyTeams(id: string, teams: string[]): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.addDataRetentionPolicyTeams,
        onSuccess: AdminTypes.ADD_DATA_RETENTION_CUSTOM_POLICY_TEAMS_SUCCESS,
        params: [
            id,
            teams,
        ],
    });
}

export function removeDataRetentionCustomPolicyTeams(id: string, teams: string[]): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            await Client4.removeDataRetentionPolicyTeams(id, teams);
        } catch (error) {
            dispatch(
                {
                    type: AdminTypes.REMOVE_DATA_RETENTION_CUSTOM_POLICY_TEAMS_FAILURE,
                    error,
                },
            );

            throw error;
        }
        const data = {
            teams,
        };
        dispatch(
            {type: AdminTypes.REMOVE_DATA_RETENTION_CUSTOM_POLICY_TEAMS_SUCCESS, data},
        );

        return {data};
    };
}

export function addDataRetentionCustomPolicyChannels(id: string, channels: string[]): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.addDataRetentionPolicyChannels,
        onSuccess: AdminTypes.ADD_DATA_RETENTION_CUSTOM_POLICY_CHANNELS_SUCCESS,
        params: [
            id,
            channels,
        ],
    });
}

export function removeDataRetentionCustomPolicyChannels(id: string, channels: string[]): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            await Client4.removeDataRetentionPolicyChannels(id, channels);
        } catch (error) {
            dispatch(
                {
                    type: AdminTypes.REMOVE_DATA_RETENTION_CUSTOM_POLICY_CHANNELS_FAILURE,
                    error,
                },
            );

            throw error;
        }
        const data = {
            channels,
        };
        dispatch(
            {type: AdminTypes.REMOVE_DATA_RETENTION_CUSTOM_POLICY_CHANNELS_SUCCESS, data},
        );

        return {data};
    };
}

export function completeSetup(completeSetup: CompleteOnboardingRequest): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.completeSetup,
        params: [completeSetup],
    });
}

export function getAppliedSchemaMigrations(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getAppliedSchemaMigrations,
    });
}
