// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SelfHostedSignupProgress} from '@mattermost/types/hosted_customer';
import {GlobalState} from '@mattermost/types/store';

import {zeroStateLimitedViews} from '../reducers/entities/posts';

const state: GlobalState = {
    entities: {
        general: {
            config: {},
            dataRetentionPolicy: {},
            license: {},
            serverVersion: '',
            warnMetricsStatus: {},
            firstAdminVisitMarketplaceStatus: false,
            firstAdminCompleteSetup: false,
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
            profilesNotInGroup: {},
            statuses: {},
            stats: {},
            myUserAccessTokens: {},
            lastActivity: {},
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
            postEditHistory: [],
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
            limitedViews: zeroStateLimitedViews,
            acknowledgements: {},
        },
        threads: {
            threadsInTeam: {},
            unreadThreadsInTeam: {},
            threads: {},
            counts: {},
            countsIncludingDirect: {},
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
            isLimitedResults: -1,
        },
        typing: {},
        roles: {
            roles: {},
            pending: new Set(),
        },
        gifs: {
            app: {
                appClassName: '',
                appId: '',
                appName: '',
                basePath: '',
                enableHistory: false,
                header: {
                    tabs: [],
                    displayText: false,
                },
                itemTapType: 0,
                shareEvent: '',
            },
            categories: {
                tagsList: [],
                tagsDict: {},
                cursor: '',
                hasMore: false,
                isFetching: false,
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
            myGroups: [],
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
            pluginEnabled: true,
        },
        cloud: {
            limits: {
                limits: {},
                limitsLoaded: false,
            },
            errors: {},
            selfHostedSignup: {
                progress: SelfHostedSignupProgress.START,
            },
        },
        hostedCustomer: {
            signupProgress: SelfHostedSignupProgress.START,
            products: {
                products: {},
                productsLoaded: false,
            },
            errors: {},
            invoices: {
                invoices: {},
                invoicesLoaded: false,
            },
            trueUpReviewProfile: {
                content: '',
                getRequestState: 'IDLE',
            },
            trueUpReviewStatus: {
                complete: false,
                due_date: 0,
                getRequestState: 'IDLE',
            },
        },
        usage: {
            files: {
                totalStorage: 0,
                totalStorageLoaded: false,
            },
            messages: {
                history: 0,
                historyLoaded: false,
            },
            teams: {
                active: 0,
                cloudArchived: 0,
                teamsLoaded: false,
            },
        },
        insights: {
            topReactions: {},
            myTopReactions: {},
        },
        worktemplates: {
            categories: [],
            templatesInCategory: {},
            playbookTemplates: [],
            linkedProducts: {},
        },
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
            createCompliance: {
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
    },
    websocket: {
        connected: false,
        lastConnectAt: 0,
        lastDisconnectAt: 0,
        connectionId: '',
    },
};
export default state;
