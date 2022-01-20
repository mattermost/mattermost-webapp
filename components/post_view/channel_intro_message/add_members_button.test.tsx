// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import thunk from 'redux-thunk';

import {mount} from 'enzyme';

import * as teams from 'mattermost-redux/selectors/entities/teams';

import {Channel} from 'mattermost-redux/types/channels';

import AddMembersButton from './add_members_button';

describe('components/post_view/AddMembersButton', () => {
    const channel = {
        create_at: 1508265709607,
        creator_id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
        delete_at: 0,
        display_name: 'testing',
        header: 'test',
        id: 'owsyt8n43jfxjpzh9np93mx1wa',
        last_post_at: 1508265709635,
        name: 'testing',
        purpose: 'test',
        team_id: 'team-id',
        type: 'O',
        update_at: 1508265709607,
    } as Channel;

    // const mockStore = configureStore();
    const initialState = {
        entities: {
            general: {
                config: {
                    DefaultClientLocale: 'en',
                },
            },
            teams: {
                currentTeamId: 'team-id',
                myMembers: {
                    'team-id': {
                        team_id: 'team-id',
                        user_id: 'test-user-id',
                        roles: 'team_user',
                        scheme_user: 'true',
                    },
                },
            },
            channels: {
                myMembers: {
                    channel_id: {channel_id: 'channel_id', roles: 'channel_role'},
                },
                roles: {
                    channel_id: ['channel_role'],
                },
            },
            users: {
                currentUserId: 'test-user-id',
                profiles: {
                    'test-user-id': {
                        id: 'test-user-id',
                        roles: 'system_user system_role',
                    },
                },
            },
            roles: {
                roles: {
                    system_role: {permissions: ['test_system_permission']},
                    team_role: {permissions: ['test_team_permission', 'add_user_to_team', 'invite_guest']},
                    channel_role: {permissions: ['test_channel_permission']},
                },
            },
        },
    };

    const mockStore = configureStore([thunk]);
    const store = mockStore(initialState);
    jest.spyOn(teams, 'getCurrentTeamId').mockReturnValue('eatxocwc3bg9ffo9xyybnj4omr');

    test('should match snapshot, less than limit', () => {
        const props = {
            totalUsers: 10,
            usersLimit: 100,
            channel,
        };
        const wrapper = mount(
            <Provider store={store}>
                <AddMembersButton {...props}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, more than limit', () => {
        const props = {
            totalUsers: 100,
            usersLimit: 10,
            channel,
        };
        const wrapper = mount(
            <Provider store={store}>
                <AddMembersButton {...props}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, setHeader and createBoard', () => {
        const createBoard = (
            <button>
                {'Create a board'}
            </button>
        );
        const setHeader = (
            <button>
                {'Create a board'}
            </button>
        );
        const props = {
            totalUsers: 100,
            usersLimit: 10,
            channel,
            setHeader,
            createBoard,
        };
        const wrapper = mount(
            <Provider store={store}>
                <AddMembersButton {...props}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
