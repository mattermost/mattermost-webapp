// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'mattermost-redux/types/store';

const state: GlobalState = {
    entities: {
        general: {
            appState: false,
            credentials: {},
            config: {},
            dataRetentionPolicy: {},
            deviceToken: '',
            license: {},
            serverVersion: '',
            warnMetricsStatus: {},
            firstAdminVisitMarketplaceStatus: false,
        },
        users: {
            currentUserId: '',
            isManualStatus: {},
            mySessions: [],
            myAudits: [],
            profiles: {},
            profilesInTeam: {},
            profilesNotInTeam: {},
            profilesWithoutTeam: new Set(),
            profilesInChannel: {},
            profilesNotInChannel: {},
            profilesInGroup: {},
            statuses: {},
            stats: {},
            myUserAccessTokens: {},
        },
        teams: {
            currentTeamId: '',
            teams: {},
            myMembers: {},
            membersInTeam: {},
            stats: {},
            groupsAssociatedToTeam: {},
            totalCount: 0,
        },
        channels: {
            currentChannelId: '',
            channels: {},
            channelsInTeam: {},
            myMembers: {},
            membersInChannel: {},
            stats: {},
            roles: {},
            groupsAssociatedToChannel: {},
            totalCount: 0,
            manuallyUnread: {},
            channelModerations: {},
            channelMemberCountsByGroup: {},
            messageCounts: {},
        },
        posts: {
            expandedURLs: {},
            posts: {},
            postsReplies: {},
            postsInChannel: {},
            postsInThread: {},
            pendingPostIds: [],
            reactions: {},
            openGraph: {},
            selectedPostId: '',
            currentFocusedPostId: '',
            messagesHistory: {
                messages: [],
                index: {
                    post: -1,
                    comment: -1,
                },
            },
        },
        threads: {
            threadsInTeam: {},
            threads: {},
            counts: {},
        },
        preferences: {
            myPreferences: {},
        },
        bots: {
            accounts: {},
        },
        admin: {
            logs: [],
            audits: {},
            config: {},
            environmentConfig: {},
            complianceReports: {},
            ldapGroups: {},
            ldapGroupsCount: 0,
            userAccessTokens: {},
            clusterInfo: [],
            analytics: {},
            dataRetentionCustomPolicies: {},
            dataRetentionCustomPoliciesCount: 0,
            prevTrialLicense: {},
        },
        jobs: {
            jobs: {},
            jobsByTypeList: {},
        },
        integrations: {
            incomingHooks: {},
            outgoingHooks: {},
            oauthApps: {},
            systemCommands: {},
            commands: {},
            appsBotIDs: [],
            appsOAuthAppIDs: [],
        },
        files: {
            files: {},
            filesFromSearch: {},
            fileIdsByPostId: {},
        },
        emojis: {
            customEmoji: {},
            nonExistentEmoji: new Set(),
        },
        search: {
            results: [],
            fileResults: [],
            current: {},
            recent: {},
            matches: {},
            flagged: [],
            pinned: {},
            isSearchingTerm: false,
            isSearchGettingMore: false,
        },
        typing: {},
        roles: {
            roles: {},
            pending: new Set(),
        },
        gifs: {
            categories: {
                tagsList: [],
                tagsDict: {},
            },
            cache: {
                gifs: {},
                updating: false,
            },
            search: {
                searchText: '',
                searchBarText: '',
                resultsByTerm: {},
                scrollPosition: 0,
                priorLocation: null,
            },
        },
        schemes: {
            schemes: {},
        },
        groups: {
            groups: {},
            syncables: {},
            myGroups: {},
            stats: {},
        },
        channelCategories: {
            byId: {},
            orderByTeam: {},
        },
        apps: {
            main: {
                bindings: [],
                forms: {},
            },
            rhs: {
                bindings: [],
                forms: {},
            },
        },
        cloud: {},
    },
    errors: [],
    requests: {
        channels: {
            getAllChannels: {
                status: 'not_started',
                error: null,
            },
            getChannels: {
                status: 'not_started',
                error: null,
            },
            myChannels: {
                status: 'not_started',
                error: null,
            },
            createChannel: {
                status: 'not_started',
                error: null,
            },
            updateChannel: {
                status: 'not_started',
                error: null,
            },
        },
        general: {
            websocket: {
                status: 'not_started',
                error: null,
            },
        },
        posts: {
            createPost: {
                status: 'not_started',
                error: null,
            },
            editPost: {
                status: 'not_started',
                error: null,
            },
            getPostThread: {
                status: 'not_started',
                error: null,
            },
        },
        teams: {
            getMyTeams: {
                status: 'not_started',
                error: null,
            },
            getTeams: {
                status: 'not_started',
                error: null,
            },
            joinTeam: {
                status: 'not_started',
                error: null,
            },
        },
        users: {
            checkMfa: {
                status: 'not_started',
                error: null,
            },
            login: {
                status: 'not_started',
                error: null,
            },
            logout: {
                status: 'not_started',
                error: null,
            },
            autocompleteUsers: {
                status: 'not_started',
                error: null,
            },
            updateMe: {
                status: 'not_started',
                error: null,
            },
        },
        admin: {
            getLogs: {
                status: 'not_started',
                error: null,
            },
            getAudits: {
                status: 'not_started',
                error: null,
            },
            getConfig: {
                status: 'not_started',
                error: null,
            },
            updateConfig: {
                status: 'not_started',
                error: null,
            },
            reloadConfig: {
                status: 'not_started',
                error: null,
            },
            testEmail: {
                status: 'not_started',
                error: null,
            },
            testSiteURL: {
                status: 'not_started',
                error: null,
            },
            testS3Connection: {
                status: 'not_started',
                error: null,
            },
            invalidateCaches: {
                status: 'not_started',
                error: null,
            },
            recycleDatabase: {
                status: 'not_started',
                error: null,
            },
            createCompliance: {
                status: 'not_started',
                error: null,
            },
            getCompliance: {
                status: 'not_started',
                error: null,
            },
            deleteBrandImage: {
                status: 'not_started',
                error: null,
            },
            disablePlugin: {
                status: 'not_started',
                error: null,
            },
            enablePlugin: {
                status: 'not_started',
                error: null,
            },
            getAnalytics: {
                status: 'not_started',
                error: null,
            },
            getClusterStatus: {
                status: 'not_started',
                error: null,
            },
            getEnvironmentConfig: {
                status: 'not_started',
                error: null,
            },
            getPluginStatuses: {
                status: 'not_started',
                error: null,
            },
            getPlugins: {
                status: 'not_started',
                error: null,
            },
            getSamlCertificateStatus: {
                status: 'not_started',
                error: null,
            },
            installPluginFromUrl: {
                status: 'not_started',
                error: null,
            },
            purgeElasticsearchIndexes: {
                status: 'not_started',
                error: null,
            },
            removeIdpSamlCertificate: {
                status: 'not_started',
                error: null,
            },
            removeLicense: {
                status: 'not_started',
                error: null,
            },
            removePlugin: {
                status: 'not_started',
                error: null,
            },
            removePrivateSamlCertificate: {
                status: 'not_started',
                error: null,
            },
            removePublicSamlCertificate: {
                status: 'not_started',
                error: null,
            },
            syncLdap: {
                status: 'not_started',
                error: null,
            },
            testElasticsearch: {
                status: 'not_started',
                error: null,
            },
            testLdap: {
                status: 'not_started',
                error: null,
            },
            uploadBrandImage: {
                status: 'not_started',
                error: null,
            },
            uploadIdpSamlCertificate: {
                status: 'not_started',
                error: null,
            },
            uploadLicense: {
                status: 'not_started',
                error: null,
            },
            uploadPlugin: {
                status: 'not_started',
                error: null,
            },
            uploadPrivateSamlCertificate: {
                status: 'not_started',
                error: null,
            },
            uploadPublicSamlCertificate: {
                status: 'not_started',
                error: null,
            },
            getLdapGroups: {
                status: 'not_started',
                error: null,
            },
            unlinkLdapGroup: {
                status: 'not_started',
                error: null,
            },
            linkLdapGroup: {
                status: 'not_started',
                error: null,
            },
        },
        files: {
            uploadFiles: {
                status: 'not_started',
                error: null,
            },
        },
        roles: {
            getRolesByNames: {
                status: 'not_started',
                error: null,
            },
            getRoleByName: {
                status: 'not_started',
                error: null,
            },
            getRole: {
                status: 'not_started',
                error: null,
            },
            editRole: {
                status: 'not_started',
                error: null,
            },
        },
        jobs: {
            createJob: {
                status: 'not_started',
                error: null,
            },
            getJob: {
                status: 'not_started',
                error: null,
            },
            getJobs: {
                status: 'not_started',
                error: null,
            },
            cancelJob: {
                status: 'not_started',
                error: null,
            },
        },
    },
    websocket: {
        connected: false,
        lastConnectAt: 0,
        lastDisconnectAt: 0,
    },
};
export default state;
