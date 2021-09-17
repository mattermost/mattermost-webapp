// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {General} from 'mattermost-redux/constants';
import {mapStateToProps} from 'components/search_results_item';

import {RHSStates} from 'utils/constants';

describe('components/SearchResultsItem/WithStore', () => {
    const team = {
        id: 'team_id',
        display_name: 'team display name',
        name: 'team_name',
    };

    const otherTeam = {
        id: 'other_team_id',
        display_name: 'other team display name',
        name: 'other_team_name',
    };

    const currentUserID = 'other';
    const user = {
        id: 'user_id',
        username: 'username',
        is_bot: false,
    };
    const channel = {
        id: 'channel_id_open',
        type: General.OPEN_CHANNEL,
        team_id: team.id,
        name: 'open channel',
        display_name: 'open channel',
    };

    const dmChannel = {
        id: 'channel_id_dm',
        type: General.DM_CHANNEL,
        name: `${currentUserID}__${user.id}`,
        display_name: `${currentUserID}__${user.id}`,
    };

    const post = {
        channel_id: channel.id,
        create_at: 1502715365009,
        delete_at: 0,
        edit_at: 1502715372443,
        id: 'id',
        is_pinned: false,
        message: 'post message',
        original_id: '',
        pending_post_id: '',
        props: {},
        root_id: '',
        type: '',
        update_at: 1502715372443,
        user_id: 'user_id',
        reply_count: 0,
    };

    const defaultState = {
        entities: {
            general: {
                config: {
                    EnablePostUsernameOverride: 'true',
                },
                license: {},
            },
            users: {
                profiles: {
                    [user.id]: user,
                },
                currentUserId: currentUserID,
            },
            channels: {
                channels: {
                    [channel.id]: channel,
                    [dmChannel.id]: dmChannel,
                },
            },
            teams: {
                myMembers: {
                    teamId: {},
                },
                teams: {
                    [team.id]: team,
                    [otherTeam.id]: otherTeam,
                },
                currentTeamId: team.id,
            },
            preferences: {
                myPreferences: {
                    hasOwnProperty: () => true,
                },
            },
            posts: {
                posts: {},
                postsInThread: {},
            },
        },
        views: {
            rhs: {
                rhsState: RHSStates.SEARCH,
            },
        },
    };

    const defaultProps = {
        compactDisplay: true,
        post,
        user,
        term: 'test',
        isMentionSearch: false,
        isBusy: false,
        status: 'hello',
        directTeammate: '',
    };

    const mstp = mapStateToProps();

    test('should not show team name if user only belongs to one team', () => {
        const newProps = mstp(defaultState, defaultProps);
        expect(newProps.channelTeamName).toBe('');
    });

    test('should show team name for open and private channels when user belongs to more than one team', () => {
        let state = {
            ...defaultState,
            entities: {
                ...defaultState.entities,
                teams: {
                    ...defaultState.entities.teams,
                    myMembers: {
                        ...defaultState.entities.teams.myMembers,
                        [otherTeam.id]: {},
                    },
                },
            },
        };
        let newProps = mstp(state, defaultProps);
        expect(newProps.channelTeamName).toBe(team.display_name);

        state = {
            ...state,
            entities: {
                ...state.entities,
                channels: {
                    ...state.entities.channels,
                    channels: {
                        ...state.entities.channels.channels,
                        [channel.id]: {
                            ...channel,
                            type: General.PRIVATE_CHANNEL,
                        },
                    },
                },
            },
        };

        newProps = mstp(state, defaultProps);
        expect(newProps.channelTeamName).toBe(team.display_name);
    });

    test('should not show team name but show reply button for private and group channels when user belongs to more than one team', () => {
        let state = {
            ...defaultState,
            entities: {
                ...defaultState.entities,
                teams: {
                    ...defaultState.entities.teams,
                    myMembers: {
                        ...defaultState.entities.teams.myMembers,
                        [otherTeam.id]: {},
                    },
                },
            },
        };

        const props = {
            ...defaultProps,
            post: {
                ...defaultProps.post,
                channel_id: dmChannel.id,
            },
        };
        let newProps = mstp(state, props);
        expect(newProps.channelTeamName).toBe('');
        expect(newProps.canReply).toBe(true);

        state = {
            ...state,
            entities: {
                ...state.entities,
                channels: {
                    ...state.entities.channels,
                    channels: {
                        ...state.entities.channels.channels,
                        [dmChannel.id]: {
                            ...dmChannel,
                            type: General.GM_CHANNEL,
                        },
                    },
                },
            },
        };
        newProps = mstp(state, props);
        expect(newProps.channelTeamName).toBe('');
        expect(newProps.canReply).toBe(true);
    });

    test('should not show team name for open and private channels when user belongs to more than one team and is looking at pinned posts', () => {
        let state = {
            ...defaultState,
            entities: {
                ...defaultState.entities,
                teams: {
                    ...defaultState.entities.teams,
                    myMembers: {
                        ...defaultState.entities.teams.myMembers,
                        [otherTeam.id]: {},
                    },
                },
            },
            views: {
                ...defaultState.views,
                rhs: {
                    ...defaultState.views.rhs,
                    rhsState: RHSStates.PIN,
                },
            },
        };
        let newProps = mstp(state, defaultProps);
        expect(newProps.channelTeamName).toBe('');

        state = {
            ...state,
            entities: {
                ...state.entities,
                channels: {
                    ...state.entities.channels,
                    channels: {
                        ...state.entities.channels.channels,
                        [channel.id]: {
                            ...channel,
                            type: General.PRIVATE_CHANNEL,
                        },
                    },
                },
            },
        };

        newProps = mstp(state, defaultProps);
        expect(newProps.channelTeamName).toBe('');
    });

    test('should show reply for channels on current team', () => {
        let state = {
            ...defaultState,
            entities: {
                ...defaultState.entities,
                teams: {
                    ...defaultState.entities.teams,
                    myMembers: {
                        ...defaultState.entities.teams.myMembers,
                        [otherTeam.id]: {},
                    },
                },
            },
        };
        let newProps = mstp(state, defaultProps);
        expect(newProps.canReply).toBe(true);

        state = {
            ...state,
            entities: {
                ...state.entities,
                channels: {
                    ...state.entities.channels,
                    channels: {
                        ...state.entities.channels.channels,
                        [channel.id]: {
                            ...channel,
                            type: General.PRIVATE_CHANNEL,
                        },
                    },
                },
            },
        };

        newProps = mstp(state, defaultProps);
        expect(newProps.canReply).toBe(true);
    });

    test('should not show reply for channels on different team', () => {
        let state = {
            ...defaultState,
            entities: {
                ...defaultState.entities,
                teams: {
                    ...defaultState.entities.teams,
                    myMembers: {
                        ...defaultState.entities.teams.myMembers,
                        [otherTeam.id]: {},
                    },
                    currentTeamId: otherTeam.id,
                },
            },
        };
        let newProps = mstp(state, defaultProps);
        expect(newProps.canReply).toBe(false);

        state = {
            ...state,
            entities: {
                ...state.entities,
                channels: {
                    ...state.entities.channels,
                    channels: {
                        ...state.entities.channels.channels,
                        [channel.id]: {
                            ...channel,
                            type: General.PRIVATE_CHANNEL,
                        },
                    },
                },
            },
        };

        newProps = mstp(state, defaultProps);
        expect(newProps.canReply).toBe(false);
    });
});
