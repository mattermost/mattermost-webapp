// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Permissions} from 'mattermost-redux/constants';

import {mapStateToProps} from './index.js';

describe('mapStateToProps', () => {
    const currentTeamId = 'team-id';
    const currentUserId = 'user-id';

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
            },
            preferences: {
                myPreferences: {},
            },
            channels: {
                channels: {},
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
        },
        views: {
            modals: {
                modalState: {},
            },
        },
    };

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
        };

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
        };

        const props = mapStateToProps(testState);
        expect(props.canInviteGuests).toBe(true);
    });
});
