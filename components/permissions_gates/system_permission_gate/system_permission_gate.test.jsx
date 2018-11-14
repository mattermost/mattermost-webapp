// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';

describe('components/permissions_gates', () => {
    const mockStore = configureStore();
    const state = {
        entities: {
            channels: {
                myMembers: {
                    channel_id: {channel_id: 'channel_id', roles: 'channel_role'},
                },
            },
            teams: {
                myMembers: {
                    team_id: {team_id: 'team_id', roles: 'team_role'},
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
                    system_role: {permissions: ['test_system_permission']},
                    team_role: {permissions: ['test_team_permission']},
                    channel_role: {permissions: ['test_channel_permission']},
                },
            },
        },
    };
    const store = mockStore(state);

    describe('SystemPermissionGate', () => {
        test('should match snapshot when user have permission', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <SystemPermissionGate permissions={['test_system_permission']}>
                        <p>{'Valid permission (shown)'}</p>
                    </SystemPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have at least on of the permissions', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <SystemPermissionGate permissions={['test_system_permission', 'not_existing_permission']}>
                        <p>{'Valid permission (shown)'}</p>
                    </SystemPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have permission and use invert', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <SystemPermissionGate
                        permissions={['test_system_permission']}
                        invert={true}
                    >
                        <p>{'Valid permission but inverted (not shown)'}</p>
                    </SystemPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user not have permission and use invert', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <SystemPermissionGate
                        permissions={['invalid_permission']}
                        invert={true}
                    >
                        <p>{'Invalid permission but inverted (shown)'}</p>
                    </SystemPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user haven\'t permission', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <SystemPermissionGate permissions={['invalid_permission']}>
                        <p>{'Invalid permission (not shown)'}</p>
                    </SystemPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
    });
});
