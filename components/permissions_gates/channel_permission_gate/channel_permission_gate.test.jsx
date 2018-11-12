// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';

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

    describe('ChannelPermissionGate', () => {
        test('should match snapshot when user have permission', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <ChannelPermissionGate
                        channelId={'channel_id'}
                        teamId={'team_id'}
                        permissions={['test_channel_permission']}
                    >
                        <p>{'Valid permission (shown)'}</p>
                    </ChannelPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have at least on of the permissions', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <TeamPermissionGate
                        teamId={'team_id'}
                        permissions={['test_team_permission', 'not_existing_permission']}
                    >
                        <p>{'Valid permission (shown)'}</p>
                    </TeamPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have permission and use invert', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <ChannelPermissionGate
                        channelId={'channel_id'}
                        teamId={'team_id'}
                        permissions={['test_channel_permission']}
                        invert={true}
                    >
                        <p>{'Valid permission but inverted (not shown)'}</p>
                    </ChannelPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user not have permission and use invert', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <ChannelPermissionGate
                        channelId={'channel_id'}
                        teamId={'team_id'}
                        permissions={['invalid_permission']}
                        invert={true}
                    >
                        <p>{'Invalid permission but inverted (shown)'}</p>
                    </ChannelPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user haven\'t permission', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <ChannelPermissionGate
                        channelId={'channel_id'}
                        teamId={'team_id'}
                        permissions={['invalid_permission']}
                    >
                        <p>{'Invalid permission (not shown)'}</p>
                    </ChannelPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when the channel doesn\'t exists', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <ChannelPermissionGate
                        channelId={'invalid_id'}
                        teamId={'team_id'}
                        permissions={['test_channel_permission']}
                    >
                        <p>{'Valid permission invalid channel (not shown)'}</p>
                    </ChannelPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have permission team wide', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <ChannelPermissionGate
                        channelId={'channel_id'}
                        teamId={'team_id'}
                        permissions={['test_team_permission']}
                    >
                        <p>{'Valid permission (shown)'}</p>
                    </ChannelPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have permission system wide', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <ChannelPermissionGate
                        channelId={'channel_id'}
                        teamId={'team_id'}
                        permissions={['test_system_permission']}
                    >
                        <p>{'Valid permission (shown)'}</p>
                    </ChannelPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot when user have permissions in DM and GM', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <ChannelPermissionGate
                        channelId={'channel_id'}
                        teamId={''}
                        permissions={['test_channel_permission']}
                    >
                        <p>{'Valid permission (shown)'}</p>
                    </ChannelPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot when user does not have permissions in DM and GM', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <ChannelPermissionGate
                        channelId={'channel_id'}
                        teamId={''}
                        permissions={['invalid_permission']}
                    >
                        <p>{'Invalid permission (not shown)'}</p>
                    </ChannelPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
    });
});
