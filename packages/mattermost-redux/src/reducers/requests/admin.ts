// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {combineReducers} from 'redux';

import {AdminTypes} from 'mattermost-redux/action_types';

import {GenericAction} from 'mattermost-redux/types/actions';
import {AdminRequestsStatuses, RequestStatusType} from 'mattermost-redux/types/requests';

import {handleRequest, initialRequestState} from './helpers';

function getLogs(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.GET_LOGS_REQUEST,
        AdminTypes.GET_LOGS_SUCCESS,
        AdminTypes.GET_LOGS_FAILURE,
        state,
        action,
    );
}

function getAudits(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.GET_AUDITS_REQUEST,
        AdminTypes.GET_AUDITS_SUCCESS,
        AdminTypes.GET_AUDITS_FAILURE,
        state,
        action,
    );
}

function getConfig(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.GET_CONFIG_REQUEST,
        AdminTypes.GET_CONFIG_SUCCESS,
        AdminTypes.GET_CONFIG_FAILURE,
        state,
        action,
    );
}

function updateConfig(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.UPDATE_CONFIG_REQUEST,
        AdminTypes.UPDATE_CONFIG_SUCCESS,
        AdminTypes.UPDATE_CONFIG_FAILURE,
        state,
        action,
    );
}

function reloadConfig(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.RELOAD_CONFIG_REQUEST,
        AdminTypes.RELOAD_CONFIG_SUCCESS,
        AdminTypes.RELOAD_CONFIG_FAILURE,
        state,
        action,
    );
}

function getEnvironmentConfig(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.GET_ENVIRONMENT_CONFIG_REQUEST,
        AdminTypes.GET_ENVIRONMENT_CONFIG_SUCCESS,
        AdminTypes.GET_ENVIRONMENT_CONFIG_FAILURE,
        state,
        action,
    );
}

function testEmail(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.TEST_EMAIL_REQUEST,
        AdminTypes.TEST_EMAIL_SUCCESS,
        AdminTypes.TEST_EMAIL_FAILURE,
        state,
        action,
    );
}

function testSiteURL(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.TEST_SITE_URL_REQUEST,
        AdminTypes.TEST_SITE_URL_SUCCESS,
        AdminTypes.TEST_SITE_URL_FAILURE,
        state,
        action,
    );
}

function testS3Connection(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.TEST_S3_REQUEST,
        AdminTypes.TEST_S3_SUCCESS,
        AdminTypes.TEST_S3_FAILURE,
        state,
        action,
    );
}

function invalidateCaches(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.INVALIDATE_CACHES_REQUEST,
        AdminTypes.INVALIDATE_CACHES_SUCCESS,
        AdminTypes.INVALIDATE_CACHES_FAILURE,
        state,
        action,
    );
}

function recycleDatabase(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.RECYCLE_DATABASE_REQUEST,
        AdminTypes.RECYCLE_DATABASE_SUCCESS,
        AdminTypes.RECYCLE_DATABASE_FAILURE,
        state,
        action,
    );
}

function createCompliance(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.CREATE_COMPLIANCE_REQUEST,
        AdminTypes.CREATE_COMPLIANCE_SUCCESS,
        AdminTypes.CREATE_COMPLIANCE_FAILURE,
        state,
        action,
    );
}

function getCompliance(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.GET_COMPLIANCE_REQUEST,
        AdminTypes.GET_COMPLIANCE_SUCCESS,
        AdminTypes.GET_COMPLIANCE_FAILURE,
        state,
        action,
    );
}

function uploadBrandImage(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.UPLOAD_BRAND_IMAGE_REQUEST,
        AdminTypes.UPLOAD_BRAND_IMAGE_SUCCESS,
        AdminTypes.UPLOAD_BRAND_IMAGE_FAILURE,
        state,
        action,
    );
}

function deleteBrandImage(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.DELETE_BRAND_IMAGE_REQUEST,
        AdminTypes.DELETE_BRAND_IMAGE_SUCCESS,
        AdminTypes.DELETE_BRAND_IMAGE_FAILURE,
        state,
        action,
    );
}

function getClusterStatus(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.GET_CLUSTER_STATUS_REQUEST,
        AdminTypes.GET_CLUSTER_STATUS_SUCCESS,
        AdminTypes.GET_CLUSTER_STATUS_FAILURE,
        state,
        action,
    );
}

function testLdap(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.TEST_LDAP_REQUEST,
        AdminTypes.TEST_LDAP_SUCCESS,
        AdminTypes.TEST_LDAP_FAILURE,
        state,
        action,
    );
}

function syncLdap(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.SYNC_LDAP_REQUEST,
        AdminTypes.SYNC_LDAP_SUCCESS,
        AdminTypes.SYNC_LDAP_FAILURE,
        state,
        action,
    );
}

function getLdapGroups(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.GET_LDAP_GROUPS_REQUEST,
        AdminTypes.GET_LDAP_GROUPS_SUCCESS,
        AdminTypes.GET_LDAP_GROUPS_FAILURE,
        state,
        action,
    );
}

function linkLdapGroup(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.LINK_LDAP_GROUP_REQUEST,
        AdminTypes.LINK_LDAP_GROUP_SUCCESS,
        AdminTypes.LINK_LDAP_GROUP_FAILURE,
        state,
        action,
    );
}

function unlinkLdapGroup(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.UNLINK_LDAP_GROUP_REQUEST,
        AdminTypes.UNLINK_LDAP_GROUP_SUCCESS,
        AdminTypes.UNLINK_LDAP_GROUP_FAILURE,
        state,
        action,
    );
}

function getSamlCertificateStatus(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.SAML_CERT_STATUS_REQUEST,
        AdminTypes.SAML_CERT_STATUS_SUCCESS,
        AdminTypes.SAML_CERT_STATUS_FAILURE,
        state,
        action,
    );
}

function uploadPublicSamlCertificate(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.UPLOAD_SAML_PUBLIC_REQUEST,
        AdminTypes.UPLOAD_SAML_PUBLIC_SUCCESS,
        AdminTypes.UPLOAD_SAML_PUBLIC_FAILURE,
        state,
        action,
    );
}

function uploadPrivateSamlCertificate(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.UPLOAD_SAML_PRIVATE_REQUEST,
        AdminTypes.UPLOAD_SAML_PRIVATE_SUCCESS,
        AdminTypes.UPLOAD_SAML_PRIVATE_FAILURE,
        state,
        action,
    );
}

function uploadIdpSamlCertificate(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.UPLOAD_SAML_IDP_REQUEST,
        AdminTypes.UPLOAD_SAML_IDP_SUCCESS,
        AdminTypes.UPLOAD_SAML_IDP_FAILURE,
        state,
        action,
    );
}

function removePublicSamlCertificate(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.DELETE_SAML_PUBLIC_REQUEST,
        AdminTypes.DELETE_SAML_PUBLIC_SUCCESS,
        AdminTypes.DELETE_SAML_PUBLIC_FAILURE,
        state,
        action,
    );
}

function removePrivateSamlCertificate(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.DELETE_SAML_PRIVATE_REQUEST,
        AdminTypes.DELETE_SAML_PRIVATE_SUCCESS,
        AdminTypes.DELETE_SAML_PRIVATE_FAILURE,
        state,
        action,
    );
}

function removeIdpSamlCertificate(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.DELETE_SAML_IDP_REQUEST,
        AdminTypes.DELETE_SAML_IDP_SUCCESS,
        AdminTypes.DELETE_SAML_IDP_FAILURE,
        state,
        action,
    );
}

function testElasticsearch(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.TEST_ELASTICSEARCH_REQUEST,
        AdminTypes.TEST_ELASTICSEARCH_SUCCESS,
        AdminTypes.TEST_ELASTICSEARCH_FAILURE,
        state,
        action,
    );
}

function purgeElasticsearchIndexes(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.PURGE_ELASTICSEARCH_INDEXES_REQUEST,
        AdminTypes.PURGE_ELASTICSEARCH_INDEXES_SUCCESS,
        AdminTypes.PURGE_ELASTICSEARCH_INDEXES_FAILURE,
        state,
        action,
    );
}

function uploadLicense(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.UPLOAD_LICENSE_REQUEST,
        AdminTypes.UPLOAD_LICENSE_SUCCESS,
        AdminTypes.UPLOAD_LICENSE_FAILURE,
        state,
        action,
    );
}

function removeLicense(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.REMOVE_LICENSE_REQUEST,
        AdminTypes.REMOVE_LICENSE_SUCCESS,
        AdminTypes.REMOVE_LICENSE_FAILURE,
        state,
        action,
    );
}

function getAnalytics(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.GET_ANALYTICS_REQUEST,
        AdminTypes.GET_ANALYTICS_SUCCESS,
        AdminTypes.GET_ANALYTICS_FAILURE,
        state,
        action,
    );
}

function uploadPlugin(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.UPLOAD_PLUGIN_REQUEST,
        AdminTypes.UPLOAD_PLUGIN_SUCCESS,
        AdminTypes.UPLOAD_PLUGIN_FAILURE,
        state,
        action,
    );
}

function installPluginFromUrl(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.INSTALL_PLUGIN_FROM_URL_REQUEST,
        AdminTypes.INSTALL_PLUGIN_FROM_URL_SUCCESS,
        AdminTypes.INSTALL_PLUGIN_FROM_URL_FAILURE,
        state,
        action,
    );
}

function getPlugins(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.GET_PLUGIN_REQUEST,
        AdminTypes.GET_PLUGIN_SUCCESS,
        AdminTypes.GET_PLUGIN_FAILURE,
        state,
        action,
    );
}

function getPluginStatuses(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.GET_PLUGIN_STATUSES_REQUEST,
        AdminTypes.GET_PLUGIN_STATUSES_SUCCESS,
        AdminTypes.GET_PLUGIN_STATUSES_FAILURE,
        state,
        action,
    );
}

function removePlugin(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.REMOVE_PLUGIN_REQUEST,
        AdminTypes.REMOVE_PLUGIN_SUCCESS,
        AdminTypes.REMOVE_PLUGIN_FAILURE,
        state,
        action,
    );
}

function enablePlugin(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.ENABLE_PLUGIN_REQUEST,
        AdminTypes.ENABLE_PLUGIN_SUCCESS,
        AdminTypes.ENABLE_PLUGIN_FAILURE,
        state,
        action,
    );
}

function disablePlugin(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        AdminTypes.DISABLE_PLUGIN_REQUEST,
        AdminTypes.DISABLE_PLUGIN_SUCCESS,
        AdminTypes.DISABLE_PLUGIN_FAILURE,
        state,
        action,
    );
}

export default (combineReducers({
    getLogs,
    getAudits,
    getConfig,
    updateConfig,
    reloadConfig,
    getEnvironmentConfig,
    testEmail,
    testSiteURL,
    testS3Connection,
    invalidateCaches,
    recycleDatabase,
    createCompliance,
    getCompliance,
    uploadBrandImage,
    deleteBrandImage,
    getClusterStatus,
    testLdap,
    syncLdap,
    getLdapGroups,
    linkLdapGroup,
    unlinkLdapGroup,
    getSamlCertificateStatus,
    uploadPublicSamlCertificate,
    uploadPrivateSamlCertificate,
    uploadIdpSamlCertificate,
    removePublicSamlCertificate,
    removePrivateSamlCertificate,
    removeIdpSamlCertificate,
    testElasticsearch,
    purgeElasticsearchIndexes,
    uploadLicense,
    removeLicense,
    getAnalytics,
    uploadPlugin,
    installPluginFromUrl,
    getPlugins,
    getPluginStatuses,
    removePlugin,
    enablePlugin,
    disablePlugin,
}) as (b: AdminRequestsStatuses, a: GenericAction) => AdminRequestsStatuses);
