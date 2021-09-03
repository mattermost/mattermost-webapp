// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {InviteMembersBtnLocations} from 'mattermost-redux/constants/config';

import InviteMembersButton from 'components/sidebar/invite_members_button';

import * as preferences from 'mattermost-redux/selectors/entities/preferences';
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
            },
            roles: {
                roles: {
                    system_role: {permissions: ['test_system_permission', 'add_user_to_team', 'invite_guest']},
                    team_role: {permissions: ['test_team_no_permission']},
                },
            },
        },
    };

    const mockStore = configureStore();
    const store = mockStore(state);
    jest.spyOn(preferences, 'getInviteMembersButtonLocation').mockReturnValue('user_icon');
    jest.spyOn(teams, 'getCurrentTeamId').mockReturnValue('team_id2sss');

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton buttonType={InviteMembersBtnLocations.NONE}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should return the user icon button when button type is USER_ICON', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton buttonType={InviteMembersBtnLocations.USER_ICON}/>
            </Provider>,
        );
        expect(wrapper.find('i').prop('className')).toBe('icon-account-plus-outline');
    });

    test('should return the left hand side button when button type is LHS_BUTTON', () => {
        jest.spyOn(preferences, 'getInviteMembersButtonLocation').mockReturnValue('lhs_button');

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton buttonType={InviteMembersBtnLocations.LHS_BUTTON}/>
            </Provider>,
        );
        expect(wrapper.find('i').prop('className')).toBe('icon-plus-box');
    });

    test('should return the sticky to the bottom button when button type is STICKY', () => {
        jest.spyOn(preferences, 'getInviteMembersButtonLocation').mockReturnValue('sticky_button');

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton buttonType={InviteMembersBtnLocations.STICKY}/>
            </Provider>,
        );
        expect(wrapper.find('i').prop('className')).toBe('icon-account-plus-outline');
    });

    test('should returnnothing when button type is NONE', () => {
        jest.spyOn(preferences, 'getInviteMembersButtonLocation').mockReturnValue('none');

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton buttonType={InviteMembersBtnLocations.NONE}/>
            </Provider>,
        );
        expect(wrapper.find('i').exists()).toBeFalsy();
    });

    test('should return nothing when user does not have permissions', () => {
        jest.spyOn(preferences, 'getInviteMembersButtonLocation').mockReturnValue('sticky_button');
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
                <InviteMembersButton buttonType={InviteMembersBtnLocations.STICKY}/>
            </Provider>,
        );
        expect(wrapper.find('i').exists()).toBeFalsy();
    });
});
