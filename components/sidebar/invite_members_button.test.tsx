// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import mockStore from 'tests/test_store';

import InviteMembersButton from 'components/sidebar/invite_members_button';

import * as teams from 'mattermost-redux/selectors/entities/teams';

describe('components/sidebar/invite_members_button', () => {
    // required state to mount using the provider
    const state = {
        entities: {
            general: {
                config: {
                    FeatureFlagInviteMembersButton: 'user_icon',
                },
            },
            teams: {
                teams: {
                    team_id: {id: 'team_id', delete_at: 0},
                    team_id2: {id: 'team_id2', delete_at: 0},
                },
                myMembers: {
                    team_id: {team_id: 'team_id', roles: 'team_role'},
                    team_id2: {team_id: 'team_id2', roles: 'team_role2'},
                },
            },
            users: {
                currentUserId: 'user_id',
                profiles: {
                    user_id: {
                        id: 'user_id',
                        roles: 'system_role',
                    },
                },
                stats: {
                    total_users_count: 10,
                },
            },
            roles: {
                roles: {
                    system_role: {permissions: ['test_system_permission', 'add_user_to_team', 'invite_guest']},
                    team_role: {permissions: ['test_team_no_permission']},
                },
            },
        },
    };

    const props = {
        onClick: jest.fn(),
        touchedInviteMembersButton: false,
        isAdmin: false,
    };

    const store = mockStore(state);
    jest.spyOn(teams, 'getCurrentTeamId').mockReturnValue('team_id2sss');

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton {...props}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should return nothing when user does not have permissions', () => {
        const guestUser = {
            currentUserId: 'guest_user_id',
            profiles: {
                user_id: {
                    id: 'guest_user_id',
                    roles: 'team_role',
                },
            },
        };
        const noPermissionsState = {...state, entities: {...state.entities, users: guestUser}};
        const store = mockStore(noPermissionsState);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton {...props}/>
            </Provider>,
        );
        expect(wrapper.find('i').exists()).toBeFalsy();
    });

    test('should fire onClick prop on click', () => {
        const mock = jest.fn();
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton {...{...props, onClick: mock}}/>
            </Provider>,
        );
        expect(mock).not.toHaveBeenCalled();
        wrapper.find('i').simulate('click');
        expect(mock).toHaveBeenCalled();
    });

    test('should not be highlighted when button has been touched/clicked', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton {...{...props, touchedInviteMembersButton: true}}/>
            </Provider>,
        );
        expect(wrapper.find('li').prop('className')).not.toContain('untouched');
    });

    test('should be highlighted when component has not been touched/clicked and has less than 10 users', () => {
        const lessThan10Users = {
            ...state.entities.users,
            stats: {
                total_users_count: 9,
            },
        };
        const lessThan10UsersState = {...state, entities: {...state.entities, users: lessThan10Users}};
        const store = mockStore(lessThan10UsersState);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton {...props}/>
            </Provider>,
        );
        expect(wrapper.find('li').prop('className')).toContain('untouched');
    });

    test('should not be highlighted when component has not been touched/clicked but the workspace has more than 10 users', () => {
        const moreThan10Users = {
            ...state.entities.users,
            stats: {
                total_users_count: 11,
            },
        };
        const moreThan10UsersState = {...state, entities: {...state.entities, users: moreThan10Users}};
        const store = mockStore(moreThan10UsersState);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton {...props}/>
            </Provider>,
        );
        expect(wrapper.find('li').prop('className')).not.toContain('untouched');
    });
});
