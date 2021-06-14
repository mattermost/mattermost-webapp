// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {AdminTypes, UserTypes} from 'mattermost-redux/action_types';
import {Stats} from 'mattermost-redux/constants';
import PluginState from 'mattermost-redux/constants/plugins';

import {GenericAction} from 'mattermost-redux/types/actions';
import {ClusterInfo, AnalyticsRow} from 'mattermost-redux/types/admin';
import {Audit} from 'mattermost-redux/types/audits';
import {Compliance} from 'mattermost-redux/types/compliance';
import {AdminConfig, EnvironmentConfig} from 'mattermost-redux/types/config';
import {MixedUnlinkedGroupRedux} from 'mattermost-redux/types/groups';
import {PluginRedux, PluginStatusRedux} from 'mattermost-redux/types/plugins';
import {SamlCertificateStatus, SamlMetadataResponse} from 'mattermost-redux/types/saml';
import {Team} from 'mattermost-redux/types/teams';
import {UserAccessToken, UserProfile} from 'mattermost-redux/types/users';
import {Dictionary, RelationOneToOne, IDMappedObjects} from 'mattermost-redux/types/utilities';
import {DataRetentionCustomPolicy} from 'mattermost-redux/types/data_retention';

function logs(state: string[] = [], action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_LOGS: {
        return action.data;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return [];

    default:
        return state;
    }
}

function audits(state: Dictionary<Audit> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_AUDITS: {
        const nextState = {...state};
        for (const audit of action.data) {
            nextState[audit.id] = audit;
        }
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function config(state: Partial<AdminConfig> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_CONFIG: {
        return action.data;
    }
    case AdminTypes.ENABLED_PLUGIN: {
        const nextPluginSettings = {...state.PluginSettings!};
        const nextPluginStates = {...nextPluginSettings.PluginStates};
        nextPluginStates[action.data] = {Enable: true};
        nextPluginSettings.PluginStates = nextPluginStates;
        return {...state, PluginSettings: nextPluginSettings};
    }
    case AdminTypes.DISABLED_PLUGIN: {
        const nextPluginSettings = {...state.PluginSettings!};
        const nextPluginStates = {...nextPluginSettings.PluginStates};
        nextPluginStates[action.data] = {Enable: false};
        nextPluginSettings.PluginStates = nextPluginStates;
        return {...state, PluginSettings: nextPluginSettings};
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function environmentConfig(state: Partial<EnvironmentConfig> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_ENVIRONMENT_CONFIG: {
        return action.data;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function complianceReports(state: Dictionary<Compliance> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_COMPLIANCE_REPORT: {
        const nextState = {...state};
        nextState[action.data.id] = action.data;
        return nextState;
    }
    case AdminTypes.RECEIVED_COMPLIANCE_REPORTS: {
        const nextState = {...state};
        for (const report of action.data) {
            nextState[report.id] = report;
        }
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function clusterInfo(state: ClusterInfo[] = [], action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_CLUSTER_STATUS: {
        return action.data;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return [];

    default:
        return state;
    }
}

function samlCertStatus(state: Partial<SamlCertificateStatus> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_SAML_CERT_STATUS: {
        return action.data;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

export function convertAnalyticsRowsToStats(data: AnalyticsRow[], name: string): Dictionary<number | AnalyticsRow[]> {
    const stats: any = {};
    const clonedData = [...data];

    if (name === 'post_counts_day') {
        clonedData.reverse();
        stats[Stats.POST_PER_DAY] = clonedData;
        return stats;
    }

    if (name === 'bot_post_counts_day') {
        clonedData.reverse();
        stats[Stats.BOT_POST_PER_DAY] = clonedData;
        return stats;
    }

    if (name === 'user_counts_with_posts_day') {
        clonedData.reverse();
        stats[Stats.USERS_WITH_POSTS_PER_DAY] = clonedData;
        return stats;
    }

    clonedData.forEach((row) => {
        let key;
        switch (row.name) {
        case 'channel_open_count':
            key = Stats.TOTAL_PUBLIC_CHANNELS;
            break;
        case 'channel_private_count':
            key = Stats.TOTAL_PRIVATE_GROUPS;
            break;
        case 'post_count':
            key = Stats.TOTAL_POSTS;
            break;
        case 'unique_user_count':
            key = Stats.TOTAL_USERS;
            break;
        case 'inactive_user_count':
            key = Stats.TOTAL_INACTIVE_USERS;
            break;
        case 'team_count':
            key = Stats.TOTAL_TEAMS;
            break;
        case 'total_websocket_connections':
            key = Stats.TOTAL_WEBSOCKET_CONNECTIONS;
            break;
        case 'total_master_db_connections':
            key = Stats.TOTAL_MASTER_DB_CONNECTIONS;
            break;
        case 'total_read_db_connections':
            key = Stats.TOTAL_READ_DB_CONNECTIONS;
            break;
        case 'daily_active_users':
            key = Stats.DAILY_ACTIVE_USERS;
            break;
        case 'monthly_active_users':
            key = Stats.MONTHLY_ACTIVE_USERS;
            break;
        case 'file_post_count':
            key = Stats.TOTAL_FILE_POSTS;
            break;
        case 'hashtag_post_count':
            key = Stats.TOTAL_HASHTAG_POSTS;
            break;
        case 'incoming_webhook_count':
            key = Stats.TOTAL_IHOOKS;
            break;
        case 'outgoing_webhook_count':
            key = Stats.TOTAL_OHOOKS;
            break;
        case 'command_count':
            key = Stats.TOTAL_COMMANDS;
            break;
        case 'session_count':
            key = Stats.TOTAL_SESSIONS;
            break;
        case 'registered_users':
            key = Stats.REGISTERED_USERS;
            break;
        }

        if (key) {
            stats[key] = row.value;
        }
    });

    return stats;
}

function analytics(state: Dictionary<number | AnalyticsRow[]> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_SYSTEM_ANALYTICS: {
        const stats = convertAnalyticsRowsToStats(action.data, action.name);
        return {...state, ...stats};
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function teamAnalytics(state: RelationOneToOne<Team, Dictionary<number | AnalyticsRow[]>> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_TEAM_ANALYTICS: {
        const nextState = {...state};
        const stats = convertAnalyticsRowsToStats(action.data, action.name);
        const analyticsForTeam = {...(nextState[action.teamId] || {}), ...stats};
        nextState[action.teamId] = analyticsForTeam;
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function userAccessTokens(state: Dictionary<UserAccessToken> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_USER_ACCESS_TOKEN: {
        return {...state, [action.data.id]: action.data};
    }
    case AdminTypes.RECEIVED_USER_ACCESS_TOKENS_FOR_USER: {
        const nextState: any = {};

        for (const uat of action.data) {
            nextState[uat.id] = uat;
        }

        return {...state, ...nextState};
    }
    case AdminTypes.RECEIVED_USER_ACCESS_TOKENS: {
        const nextState: any = {};

        for (const uat of action.data) {
            nextState[uat.id] = uat;
        }

        return {...state, ...nextState};
    }
    case UserTypes.REVOKED_USER_ACCESS_TOKEN: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data);
        return {...nextState};
    }
    case UserTypes.ENABLED_USER_ACCESS_TOKEN: {
        const token = {...state[action.data], is_active: true};
        return {...state, [action.data]: token};
    }
    case UserTypes.DISABLED_USER_ACCESS_TOKEN: {
        const token = {...state[action.data], is_active: false};
        return {...state, [action.data]: token};
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function userAccessTokensByUser(state: RelationOneToOne<UserProfile, Dictionary<UserAccessToken>> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_USER_ACCESS_TOKEN: { // UserAccessToken
        const nextUserState: UserAccessToken | Dictionary<UserAccessToken> = {...(state[action.data.user_id] || {})};
        nextUserState[action.data.id] = action.data;

        return {...state, [action.data.user_id]: nextUserState};
    }
    case AdminTypes.RECEIVED_USER_ACCESS_TOKENS_FOR_USER: { // UserAccessToken[]
        const nextUserState = {...(state[action.userId] || {})};

        for (const uat of action.data) {
            nextUserState[uat.id] = uat;
        }

        return {...state, [action.userId]: nextUserState};
    }
    case AdminTypes.RECEIVED_USER_ACCESS_TOKENS: { // UserAccessToken[]
        const nextUserState: any = {};

        for (const uat of action.data) {
            nextUserState[uat.user_id] = nextUserState[uat.user_id] || {};
            nextUserState[uat.user_id][uat.id] = uat;
        }

        return {...state, ...nextUserState};
    }
    case UserTypes.REVOKED_USER_ACCESS_TOKEN: {
        const userIds = Object.keys(state);
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            if (state[userId] && state[userId][action.data]) {
                const nextUserState = {...state[userId]};
                Reflect.deleteProperty(nextUserState, action.data);
                return {...state, [userId]: nextUserState};
            }
        }

        return state;
    }
    case UserTypes.ENABLED_USER_ACCESS_TOKEN: {
        const userIds = Object.keys(state);
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            if (state[userId] && state[userId][action.data]) {
                const nextUserState = {...state[userId]};
                const token = {...nextUserState[action.data], is_active: true};
                nextUserState[token.id] = token;
                return {...state, [userId]: nextUserState};
            }
        }

        return state;
    }
    case UserTypes.DISABLED_USER_ACCESS_TOKEN: {
        const userIds = Object.keys(state);
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            if (state[userId] && state[userId][action.data]) {
                const nextUserState = {...state[userId]};
                const token = {...nextUserState[action.data], is_active: false};
                nextUserState[token.id] = token;
                return {...state, [userId]: nextUserState};
            }
        }

        return state;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function plugins(state: Dictionary<PluginRedux> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_PLUGINS: {
        const nextState = {...state};
        const activePlugins = action.data.active;
        for (const plugin of activePlugins) {
            nextState[plugin.id] = {...plugin, active: true};
        }

        const inactivePlugins = action.data.inactive;
        for (const plugin of inactivePlugins) {
            nextState[plugin.id] = {...plugin, active: false};
        }
        return nextState;
    }
    case AdminTypes.REMOVED_PLUGIN: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data);
        return nextState;
    }
    case AdminTypes.ENABLED_PLUGIN: {
        const nextState = {...state};
        const plugin = nextState[action.data];
        if (plugin && !plugin.active) {
            nextState[action.data] = {...plugin, active: true};
            return nextState;
        }
        return state;
    }
    case AdminTypes.DISABLED_PLUGIN: {
        const nextState = {...state};
        const plugin = nextState[action.data];
        if (plugin && plugin.active) {
            nextState[action.data] = {...plugin, active: false};
            return nextState;
        }
        return state;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function pluginStatuses(state: Dictionary<PluginStatusRedux> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_PLUGIN_STATUSES: {
        const nextState: any = {};

        for (const plugin of (action.data || [])) {
            const id = plugin.plugin_id;

            // The plugin may be in different states across the cluster. Pick the highest one to
            // surface an error.
            const pluginState = Math.max((nextState[id] && nextState[id].state) || 0, plugin.state);

            const instances = [
                ...((nextState[id] && nextState[id].instances) || []),
                {
                    cluster_id: plugin.cluster_id,
                    version: plugin.version,
                    state: plugin.state,
                },
            ];

            nextState[id] = {
                id,
                name: (nextState[id] && nextState[id].name) || plugin.name,
                description: (nextState[id] && nextState[id].description) || plugin.description,
                version: (nextState[id] && nextState[id].version) || plugin.version,
                active: pluginState > 0,
                state: pluginState,
                instances,
            };
        }

        return nextState;
    }

    case AdminTypes.ENABLE_PLUGIN_REQUEST: {
        const pluginId = action.data;
        if (!state[pluginId]) {
            return state;
        }

        return {
            ...state,
            [pluginId]: {
                ...state[pluginId],
                state: PluginState.PLUGIN_STATE_STARTING,
            },
        };
    }

    case AdminTypes.DISABLE_PLUGIN_REQUEST: {
        const pluginId = action.data;
        if (!state[pluginId]) {
            return state;
        }

        return {
            ...state,
            [pluginId]: {
                ...state[pluginId],
                state: PluginState.PLUGIN_STATE_STOPPING,
            },
        };
    }

    case AdminTypes.REMOVED_PLUGIN: {
        const pluginId = action.data;
        if (!state[pluginId]) {
            return state;
        }

        const nextState = {...state};
        Reflect.deleteProperty(nextState, pluginId);

        return nextState;
    }

    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function ldapGroupsCount(state = 0, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_LDAP_GROUPS:
        return action.data.count;
    case UserTypes.LOGOUT_SUCCESS:
        return 0;
    default:
        return state;
    }
}

function ldapGroups(state: Dictionary<MixedUnlinkedGroupRedux> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_LDAP_GROUPS: {
        const nextState: any = {};
        for (const group of action.data.groups) {
            nextState[group.primary_key] = group;
        }
        return nextState;
    }
    case AdminTypes.LINKED_LDAP_GROUP: {
        const nextState = {...state};
        if (nextState[action.data.primary_key]) {
            nextState[action.data.primary_key] = action.data;
        }
        return nextState;
    }
    case AdminTypes.UNLINKED_LDAP_GROUP: {
        const nextState = {...state};
        if (nextState[action.data]) {
            nextState[action.data] = {
                ...nextState[action.data],
                mattermost_group_id: undefined,
                has_syncables: undefined,
                failed: false,
            };
        }
        return nextState;
    }
    case AdminTypes.LINK_LDAP_GROUP_FAILURE: {
        const nextState = {...state};
        if (nextState[action.data]) {
            nextState[action.data] = {
                ...nextState[action.data],
                failed: true,
            };
        }
        return nextState;
    }
    case AdminTypes.UNLINK_LDAP_GROUP_FAILURE: {
        const nextState = {...state};
        if (nextState[action.data]) {
            nextState[action.data] = {
                ...nextState[action.data],
                failed: true,
            };
        }
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function samlMetadataResponse(state: Partial<SamlMetadataResponse> = {}, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_SAML_METADATA_RESPONSE: {
        return action.data;
    }
    default:
        return state;
    }
}

function dataRetentionCustomPolicies(state: IDMappedObjects<DataRetentionCustomPolicy> = {}, action: GenericAction): IDMappedObjects<DataRetentionCustomPolicy> {
    switch (action.type) {
    case AdminTypes.CREATE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS:
    case AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY:
    case AdminTypes.UPDATE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS: {
        return {
            ...state,
            [action.data.id]: action.data,
        };
    }

    case AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICIES: {
        const nextState = {...state};
        for (const dataRetention of action.data.policies) {
            nextState[dataRetention.id] = dataRetention;
        }
        return nextState;
    }

    case AdminTypes.DELETE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.id);
        return nextState;
    }

    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}
function dataRetentionCustomPoliciesCount(state = 0, action: GenericAction) {
    switch (action.type) {
    case AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICIES:
        return action.data.total_count;
    case UserTypes.LOGOUT_SUCCESS:
        return 0;
    default:
        return state;
    }
}

export default combineReducers({

    // array of strings each representing a log entry
    logs,

    // object where every key is an audit id and has an object with audit details
    audits,

    // object representing the server configuration
    config,

    // object representing which fields of the server configuration were set through the environment config
    environmentConfig,

    // object where every key is a report id and has an object with report details
    complianceReports,

    // array of cluster status data
    clusterInfo,

    // object with certificate type as keys and boolean statuses as values
    samlCertStatus,

    // object with analytic categories as types and numbers as values
    analytics,

    // object with team ids as keys and analytics objects as values
    teamAnalytics,

    // object with user ids as keys and objects, with token ids as keys, and
    // user access tokens as values without actual token
    userAccessTokensByUser,

    // object with token ids as keys, and user access tokens as values without actual token
    userAccessTokens,

    // object with plugin ids as keys and objects representing plugin manifests as values
    plugins,

    // object with plugin ids as keys and objects representing plugin statuses across the cluster
    pluginStatuses,

    // object representing the ldap groups
    ldapGroups,

    // total ldap groups
    ldapGroupsCount,

    // object representing the metadata response obtained from the IdP
    samlMetadataResponse,

    // object representing the custom data retention policies
    dataRetentionCustomPolicies,

    // total custom retention policies
    dataRetentionCustomPoliciesCount,
});
