// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {mount} from 'enzyme';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';

describe('components/permissions_gates', () => {
    const mockStore = configureStore();
    const state = {
        entities: {
            channels: {
                myMembers: {
                    channel_id: {channel_id: 'channel_id', roles: 'channel_role'}
                }
            },
            teams: {
                myMembers: {
                    team_id: {team_id: 'team_id', roles: 'team_role'}
                }
            },
            users: {
                currentUserId: 'user_id',
                profiles: {
                    user_id: {
                        id: 'user_id',
                        roles: 'system_role'
                    }
                }
            },
            roles: {
                roles: {
                    system_role: {permissions: ['test_system_perm']},
                    team_role: {permissions: ['test_team_perm']},
                    channel_role: {permissions: ['test_channel_perm']}
                }
            }
        }
    };
    const store = mockStore(state);

    describe('SystemPermissionGate', () => {
        test('should match snapshot when user have permission', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <SystemPermissionGate perms={['test_system_perm']}>
                        <p>{'Valid perm (shown)'}</p>
                    </SystemPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have at least on of the permissions', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <SystemPermissionGate perms={['test_system_perm', 'not_existing_perm']}>
                        <p>{'Valid perm (shown)'}</p>
                    </SystemPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have permission and use invert', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <SystemPermissionGate
                        perms={['test_system_perm']}
                        invert={true}
                    >
                        <p>{'Valid perm but inverted (not shown)'}</p>
                    </SystemPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user not have permission and use invert', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <SystemPermissionGate
                        perms={['invalid_perm']}
                        invert={true}
                    >
                        <p>{'Invalid perm but inverted (shown)'}</p>
                    </SystemPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user haven\'t permission', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <SystemPermissionGate perms={['invalid_perm']}>
                        <p>{'Invalid perm (not shown)'}</p>
                    </SystemPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('TeamPermissionGate', () => {
        test('should match snapshot when user have permission', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <TeamPermissionGate
                        teamId={'team_id'}
                        perms={['test_team_perm']}
                    >
                        <p>{'Valid perm (shown)'}</p>
                    </TeamPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have at least on of the permissions', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <TeamPermissionGate
                        teamId={'team_id'}
                        perms={['test_team_perm', 'not_existing_perm']}
                    >
                        <p>{'Valid perm (shown)'}</p>
                    </TeamPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have permission and use invert', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <TeamPermissionGate
                        teamId={'team_id'}
                        perms={['test_team_perm']}
                        invert={true}
                    >
                        <p>{'Valid perm but inverted (not shown)'}</p>
                    </TeamPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user not have permission and use invert', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <TeamPermissionGate
                        teamId={'team_id'}
                        perms={['invalid_perm']}
                        invert={true}
                    >
                        <p>{'Invalid perm but inverted (shown)'}</p>
                    </TeamPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user haven\'t permission', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <TeamPermissionGate
                        teamId={'team_id'}
                        perms={['invalid_perm']}
                    >
                        <p>{'Invalid perm (not shown)'}</p>
                    </TeamPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when the team doesn\'t exists', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <TeamPermissionGate
                        teamId={'invalid_id'}
                        perms={['test_team_perm']}
                    >
                        <p>{'Valid perm invalid team (not shown)'}</p>
                    </TeamPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when user have permission system wide', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <TeamPermissionGate
                        teamId={'team_id'}
                        perms={['test_system_perm']}
                    >
                        <p>{'Valid perm (shown)'}</p>
                    </TeamPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('ChannelPermissionGate', () => {
        test('should match snapshot when user have permission', () => {
            const wrapper = mount(
                <Provider store={store}>
                    <ChannelPermissionGate
                        channelId={'channel_id'}
                        teamId={'team_id'}
                        perms={['test_channel_perm']}
                    >
                        <p>{'Valid perm (shown)'}</p>
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
                        perms={['test_team_perm', 'not_existing_perm']}
                    >
                        <p>{'Valid perm (shown)'}</p>
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
                        perms={['test_channel_perm']}
                        invert={true}
                    >
                        <p>{'Valid perm but inverted (not shown)'}</p>
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
                        perms={['invalid_perm']}
                        invert={true}
                    >
                        <p>{'Invalid perm but inverted (shown)'}</p>
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
                        perms={['invalid_perm']}
                    >
                        <p>{'Invalid perm (not shown)'}</p>
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
                        perms={['test_channel_perm']}
                    >
                        <p>{'Valid perm invalid channel (not shown)'}</p>
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
                        perms={['test_team_perm']}
                    >
                        <p>{'Valid perm (shown)'}</p>
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
                        perms={['test_system_perm']}
                    >
                        <p>{'Valid perm (shown)'}</p>
                    </ChannelPermissionGate>
                </Provider>
            );

            expect(wrapper).toMatchSnapshot();
        });
    });
});
