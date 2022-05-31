// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {screen} from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';

import {renderWithIntl} from 'tests/react_testing_utils';
import {Channel} from '@mattermost/types/channels';
import {UserProfile} from '@mattermost/types/users';

import AboutAreaGM from './about_area_gm';

const mockStore = configureStore([thunk]);

const initialState = {
    entities: {
        channels: {
            currentChannelId: 'current_channel_id',
            myMembers: {
                current_channel_id: {
                    channel_id: 'current_channel_id',
                    user_id: 'current_user_id',
                    roles: 'channel_role',
                    mention_count: 1,
                    msg_count: 9,
                },
            },
            channels: {
                current_channel_id: {
                    id: 'current_channel_id',
                    name: 'default-name',
                    display_name: 'Default',
                    delete_at: 0,
                    type: 'O',
                    team_id: 'team_id',
                },
                current_user_id__existingId: {
                    id: 'current_user_id__existingId',
                    name: 'current_user_id__existingId',
                    display_name: 'Default',
                    delete_at: 0,
                    type: '0',
                    team_id: 'team_id',
                },
            },
            channelsInTeam: {
                'team-id': ['current_channel_id'],
            },
            messageCounts: {
                current_channel_id: {total: 10},
                current_user_id__existingId: {total: 0},
            },
        },
        teams: {
            currentTeamId: 'team-id',
            teams: {
                'team-id': {
                    id: 'team_id',
                    name: 'team-1',
                    displayName: 'Team 1',
                },
            },
            myMembers: {
                'team-id': {roles: 'team_role'},
            },
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_role'},
                'test-u-id': {username: 'my username'},
                'test-u-id2': {username: 'my username 2'},
            },
        },
        groups: {
            groups: {},
            syncables: {},
            myGroups: [],
            stats: {},
        },
        emojis: {customEmoji: {}},
        preferences: {
            myPreferences: {
                'display_settings--name_format': {
                    category: 'display_settings',
                    name: 'name_format',
                    user_id: 'current_user_id',
                    value: 'username',
                },
            },
        },
        roles: {
            roles: {
                system_role: {
                    permissions: [],
                },
                team_role: {
                    permissions: [],
                },
                channel_role: {
                    permissions: [],
                },
            },
        },
        general: {
            license: {IsLicensed: 'false'},
            serverVersion: '5.4.0',
            config: {PostEditTimeLimit: -1},
        },
    },
};

describe('channel_info_rhs/about_area_gm', () => {
    const defaultProps = {
        channel: {
            id: 'test-c-id',
            header: 'my channel header',
        } as Channel,
        gmUsers: [
            {
                id: 'test-u-id',
                last_picture_update: 1234,
                username: 'my username',
            } as UserProfile,
            {
                id: 'test-u-id2',
                last_picture_update: 4321,
                username: 'my username2',
            } as UserProfile,
        ],
        actions: {
            editChannelHeader: jest.fn(),
        },
    };

    test('should display users avatar', async () => {
        const store = await mockStore(initialState);

        renderWithIntl(
            <Provider store={store}>
                <AboutAreaGM
                    {...defaultProps}
                />
            </Provider>,
        );

        expect(screen.getByAltText('my username profile image')).toBeInTheDocument();
        expect(screen.getByAltText('my username2 profile image')).toBeInTheDocument();
    });

    test('should display user names', async () => {
        const store = await mockStore(initialState);

        renderWithIntl(
            <Provider store={store}>
                <AboutAreaGM
                    {...defaultProps}
                />
            </Provider>,
        );

        expect(screen.getByLabelText('my username')).toBeInTheDocument();
    });

    test('should display channel header', async () => {
        const store = await mockStore(initialState);
        renderWithIntl(
            <Provider store={store}>
                <AboutAreaGM
                    {...defaultProps}
                />
            </Provider>,
        );

        expect(screen.getByText('my channel header')).toBeInTheDocument();
    });
});
