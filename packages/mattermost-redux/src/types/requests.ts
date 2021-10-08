// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type RequestStatusOption = 'not_started' | 'started' | 'success' | 'failure' | 'cancelled';
export type RequestStatusType = {
    status: RequestStatusOption;
    error: null | Record<string, any>;
};

export type ChannelsRequestsStatuses = {
    getChannels: RequestStatusType;
    getAllChannels: RequestStatusType;
    myChannels: RequestStatusType;
    createChannel: RequestStatusType;
    updateChannel: RequestStatusType;
};

export type GeneralRequestsStatuses = {
    websocket: RequestStatusType;
};

export type PostsRequestsStatuses = {
    createPost: RequestStatusType;
    editPost: RequestStatusType;
    getPostThread: RequestStatusType;
};

export type ThreadsRequestStatuses = {
    getThreads: RequestStatusType;
};

export type TeamsRequestsStatuses = {
    getMyTeams: RequestStatusType;
    getTeams: RequestStatusType;
    joinTeam: RequestStatusType;
};

export type UsersRequestsStatuses = {
    checkMfa: RequestStatusType;
    login: RequestStatusType;
    logout: RequestStatusType;
    autocompleteUsers: RequestStatusType;
    updateMe: RequestStatusType;
};

export type AdminRequestsStatuses = {
    getLogs: RequestStatusType;
    getAudits: RequestStatusType;
    getConfig: RequestStatusType;
    updateConfig: RequestStatusType;
    reloadConfig: RequestStatusType;
    testEmail: RequestStatusType;
    testSiteURL: RequestStatusType;
    invalidateCaches: RequestStatusType;
    recycleDatabase: RequestStatusType;
    createCompliance: RequestStatusType;
    getCompliance: RequestStatusType;
    testS3Connection: RequestStatusType;
    getLdapGroups: RequestStatusType;
    linkLdapGroup: RequestStatusType;
    unlinkLdapGroup: RequestStatusType;
    deleteBrandImage: RequestStatusType;
    disablePlugin: RequestStatusType;
    enablePlugin: RequestStatusType;
    getAnalytics: RequestStatusType;
    getClusterStatus: RequestStatusType;
    getEnvironmentConfig: RequestStatusType;
    getPluginStatuses: RequestStatusType;
    getPlugins: RequestStatusType;
    getSamlCertificateStatus: RequestStatusType;
    installPluginFromUrl: RequestStatusType;
    purgeElasticsearchIndexes: RequestStatusType;
    removeIdpSamlCertificate: RequestStatusType;
    removeLicense: RequestStatusType;
    removePlugin: RequestStatusType;
    removePrivateSamlCertificate: RequestStatusType;
    removePublicSamlCertificate: RequestStatusType;
    syncLdap: RequestStatusType;
    testElasticsearch: RequestStatusType;
    testLdap: RequestStatusType;
    uploadBrandImage: RequestStatusType;
    uploadIdpSamlCertificate: RequestStatusType;
    uploadLicense: RequestStatusType;
    uploadPlugin: RequestStatusType;
    uploadPrivateSamlCertificate: RequestStatusType;
    uploadPublicSamlCertificate: RequestStatusType;
};

export type EmojisRequestsStatuses = {
    createCustomEmoji: RequestStatusType;
    getCustomEmojis: RequestStatusType;
    deleteCustomEmoji: RequestStatusType;
    getAllCustomEmojis: RequestStatusType;
    getCustomEmoji: RequestStatusType;
};

export type FilesRequestsStatuses = {
    uploadFiles: RequestStatusType;
};

export type RolesRequestsStatuses = {
    getRolesByNames: RequestStatusType;
    getRoleByName: RequestStatusType;
    getRole: RequestStatusType;
    editRole: RequestStatusType;
};

export type JobsRequestsStatuses = {
    createJob: RequestStatusType;
    getJob: RequestStatusType;
    getJobs: RequestStatusType;
    cancelJob: RequestStatusType;
};

export type SearchRequestsStatuses = {
    flaggedPosts: RequestStatusType;
    pinnedPosts: RequestStatusType;
};
