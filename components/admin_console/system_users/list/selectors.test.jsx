// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as users from 'mattermost-redux/selectors/entities/users';

import {getUsers} from 'components/admin_console/system_users/list/selectors.jsx';

jest.mock('mattermost-redux/selectors/entities/users');

describe('components/admin_console/system_users/list/selectors', () => {
    const state = {};

    test('should return no users when loading', () => {
        const loading = true;
        const teamId = 'teamId';
        const term = 'term';

        expect(getUsers(state, loading, teamId, term)).toEqual([]);
    });

    describe('should search by term', () => {
        const loading = false;

        describe('over all profiles', () => {
            const teamId = '';

            it('returning users users', () => {
                const term = 'term';

                const expectedUsers = [{id: 'id1'}, {id: 'id2'}];
                users.searchProfiles.mockReturnValue(expectedUsers);

                expect(getUsers(state, loading, teamId, term)).toEqual(expectedUsers);
                expect(users.searchProfiles).toBeCalledWith(state, term, false, {});
            });

            describe('falling back to fetching user by id', () => {
                const term = 'x'.repeat(26);

                it('and the user is found', () => {
                    const expectedUsers = [{id: 'id1'}];
                    users.searchProfiles.mockReturnValue([]);
                    users.getUser.mockReturnValue(expectedUsers[0]);

                    expect(getUsers(state, loading, teamId, term)).toEqual(expectedUsers);
                    expect(users.searchProfiles).toBeCalledWith(state, term, false, {});
                    expect(users.getUser).toBeCalledWith(state, term);
                });

                it('and the user is not found', () => {
                    const expectedUsers = [];
                    users.searchProfiles.mockReturnValue([]);
                    users.getUser.mockReturnValue(null);

                    expect(getUsers(state, loading, teamId, term)).toEqual(expectedUsers);
                    expect(users.searchProfiles).toBeCalledWith(state, term, false, {});
                    expect(users.getUser).toBeCalledWith(state, term);
                });
            });
        });

        describe('and team id', () => {
            const teamId = 'teamId';

            it('returning users users found in team', () => {
                const term = 'term';

                const expectedUsers = [{id: 'id1'}, {id: 'id2'}];
                users.searchProfilesInTeam.mockReturnValue(expectedUsers);

                expect(getUsers(state, loading, teamId, term)).toEqual(expectedUsers);
                expect(users.searchProfilesInTeam).toBeCalledWith(state, teamId, term, false, {});
            });

            describe('falling back to fetching user by id', () => {
                const term = 'x'.repeat(26);

                it('and the user is found', () => {
                    const expectedUsers = [{id: 'id1'}];
                    users.searchProfilesInTeam.mockReturnValue([]);
                    users.getUser.mockReturnValue(expectedUsers[0]);

                    expect(getUsers(state, loading, teamId, term)).toEqual(expectedUsers);
                    expect(users.searchProfilesInTeam).toBeCalledWith(state, teamId, term, false, {});
                    expect(users.getUser).toBeCalledWith(state, term);
                });

                it('and the user is not found', () => {
                    const expectedUsers = [];
                    users.searchProfilesInTeam.mockReturnValue([]);
                    users.getUser.mockReturnValue(null);

                    expect(getUsers(state, loading, teamId, term)).toEqual(expectedUsers);
                    expect(users.searchProfilesInTeam).toBeCalledWith(state, teamId, term, false, {});
                    expect(users.getUser).toBeCalledWith(state, term);
                });
            });
        });
    });

    describe('should return', () => {
        const loading = false;
        const term = '';

        it('all profiles', () => {
            const teamId = '';

            const expectedUsers = [{id: 'id1'}, {id: 'id2'}];
            users.getProfiles.mockReturnValue(expectedUsers);

            expect(getUsers(state, loading, teamId, term)).toEqual(expectedUsers);
            expect(users.getProfiles).toBeCalledWith(state, {});
        });

        it('profiles without a team', () => {
            const teamId = 'no_team';

            const expectedUsers = [{id: 'id1'}, {id: 'id2'}];
            users.getProfilesWithoutTeam.mockReturnValue(expectedUsers);

            expect(getUsers(state, loading, teamId, term)).toEqual(expectedUsers);
            expect(users.getProfilesWithoutTeam).toBeCalledWith(state, {});
        });

        it('profiles for the given team', () => {
            const teamId = 'team_id1';

            const expectedUsers = [{id: 'id1'}, {id: 'id2'}];
            users.getProfilesInTeam.mockReturnValue(expectedUsers);
            expect(getUsers(state, loading, teamId, term)).toEqual(expectedUsers);
            expect(users.getProfilesInTeam).toBeCalledWith(state, teamId, {});
        });
    });

    describe('filters', () => {
        const loading = false;
        const term = '';
        const systemAdmin = 'system_admin';
        const roleFilter = {role: 'system_admin'};
        const inactiveFilter = {inactive: true};
        const inactive = 'inactive';

        it('all profiles with system admin', () => {
            const teamId = '';

            const expectedUsers = [{id: 'id1'}];
            users.getProfiles.mockReturnValue(expectedUsers);

            expect(getUsers(state, loading, teamId, term, systemAdmin)).toEqual(expectedUsers);
            expect(users.getProfiles).toBeCalledWith(state, roleFilter);
        });

        it('inactive profiles without a team', () => {
            const teamId = 'no_team';

            const expectedUsers = [{id: 'id1'}, {id: 'id2'}];
            users.getProfilesWithoutTeam.mockReturnValue(expectedUsers);

            expect(getUsers(state, loading, teamId, term, inactive)).toEqual(expectedUsers);
            expect(users.getProfilesWithoutTeam).toBeCalledWith(state, inactiveFilter);
        });

        it('system admin profiles for the given team', () => {
            const teamId = 'team_id1';

            const expectedUsers = [{id: 'id2'}];
            users.getProfilesInTeam.mockReturnValue(expectedUsers);
            expect(getUsers(state, loading, teamId, term, systemAdmin)).toEqual(expectedUsers);
            expect(users.getProfilesInTeam).toBeCalledWith(state, teamId, roleFilter);
        });
    });
});
