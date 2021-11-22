// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Permissions} from 'mattermost-redux/constants';
import {GlobalState} from 'mattermost-redux/types/store';

import {mapStateToProps} from './index';

describe('mapStateToProps', () => {
    const currentTeamId = 'team-id';
    const currentUserId = 'user-id';
    const currentChannelId = 'channel-id';

    const initialState = {
        entities: {
            general: {
                config: {
                    EnableGuestAccounts: 'true',
                },
                license: {
                    IsLicensed: 'true',
                },
            },
            teams: {
                currentTeamId,
                teams: {
                    [currentTeamId]: {
                        display_name: 'team1',
                    },
                },
                myMembers: {},
            },
            preferences: {
                myPreferences: {},
            },
            channels: {
                channels: {
                    [currentChannelId]: {
                        display_name: 'team1',
                    },
                },
                currentChannelId,
                channelsInTeam: {
                    [currentTeamId]: new Set(),
                },
            },
            users: {
                currentUserId,
                profiles: {
                    [currentUserId]: {
                        id: currentUserId,
                        roles: 'test_user_role',
                    },
                },
            },
            roles: {
                roles: {
                    test_user_role: {permissions: [Permissions.INVITE_GUEST]},
                },
            },
            cloud: {
                subscriptionStats: {
                    is_paid_tier: 'false',
                    remaining_seats: 1,
                },
            },
        },
        views: {
            modals: {
                modalState: {},
            },
        },
        errors: [],
        websocket: {},
        requests: {},
    } as unknown as GlobalState;

    test('canInviteGuests is false when group_constrained is true', () => {
        const testState = {
            ...initialState,
            entities: {
                ...initialState.entities,
                teams: {
                    ...initialState.entities.teams,
                    teams: {
                        [currentTeamId]: {
                            id: currentTeamId,
                            group_constrained: true,
                        },
                    },
                },
            },
        } as unknown as GlobalState;

        const props = mapStateToProps(testState);
        expect(props.canInviteGuests).toBe(false);
    });

    test('canInviteGuests is true when group_constrained is false', () => {
        const testState = {
            ...initialState,
            entities: {
                ...initialState.entities,
                teams: {
                    ...initialState.entities.teams,
                    myMembers: {
                        ...initialState.entities.teams.myMembers,
                    },
                    teams: {
                        [currentTeamId]: {
                            id: currentTeamId,
                            group_constrained: false,
                        },
                    },
                },
            },
        } as unknown as GlobalState;

        const props = mapStateToProps(testState);
        expect(props.canInviteGuests).toBe(true);
    });
});
