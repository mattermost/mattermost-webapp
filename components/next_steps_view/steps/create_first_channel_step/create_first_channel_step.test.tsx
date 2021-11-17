// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import thunk from 'redux-thunk';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import {TestHelper} from 'utils/test_helper';

import * as teams from 'mattermost-redux/selectors/entities/teams';

import CreateFirstChannelStep from './create_first_channel_step';

jest.mock('mattermost-redux/actions/channels', () => ({
    ...jest.requireActual('mattermost-redux/actions/channels.ts'),
    createChannel: jest.fn(),
}));

describe('components/sidebar/invite_members_button', () => {
    // required state to mount using the provider
    const state = {
        entities: {
            general: {
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
                    system_role: {
                        permissions: [
                            'test_system_permission',
                            'add_user_to_team',
                            'invite_guest',
                        ],
                    },
                    team_role: {permissions: ['test_team_no_permission']},
                },
            },
        },
    };

    const props = {
        id: 'test',
        currentUser: TestHelper.getUserMock(),
        expanded: true,
        isAdmin: false,
        isLastStep: false,
        onSkip: () => {},
        onFinish: () => {},
    };

    const mockStore = configureStore([thunk]);
    const store = mockStore(state);
    jest.spyOn(teams, 'getCurrentTeamId').mockReturnValue('team_id2sss');

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <CreateFirstChannelStep {...props}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have a legend', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <CreateFirstChannelStep {...props}/>
            </Provider>,
        );

        const legend = wrapper.find('.channelNameLegend');

        expect(legend).toHaveLength(1);
    });

    test('should have the input', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <CreateFirstChannelStep {...props}/>
            </Provider>,
        );

        const input = wrapper.find('input#newChannelName');

        expect(input).toHaveLength(1);
    });

    test('should have the button and be disabled', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <CreateFirstChannelStep {...props}/>
            </Provider>,
        );

        const button = wrapper.find('#submitNewChannel');

        expect(button).toHaveLength(1);
        expect(button.getDOMNode()).toHaveAttribute('disabled');
    });
});
