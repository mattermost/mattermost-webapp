// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';

import store from 'stores/redux_store.jsx';
import {mountWithThemedIntl} from 'tests/helpers/themed-intl-test-helper';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {Team} from '@mattermost/types/teams';
import {generateId} from 'utils/utils';

import InviteAs, {InviteType} from './invite_as';
import InviteView, {Props} from './invite_view';

const defaultProps: Props = deepFreeze({
    setInviteAs: jest.fn(),
    inviteType: InviteType.MEMBER,
    titleClass: 'title',

    invite: jest.fn(),
    onChannelsChange: jest.fn(),
    onChannelsInputChange: jest.fn(),
    onClose: jest.fn(),
    currentTeam: {} as Team,
    currentChannel: {
        display_name: 'some_channel',
    },
    setCustomMessage: jest.fn(),
    toggleCustomMessage: jest.fn(),
    channelsLoader: jest.fn(),
    regenerateTeamInviteId: jest.fn(),
    isAdmin: false,
    usersLoader: jest.fn(),
    onChangeUsersEmails: jest.fn(),
    isCloud: false,
    emailInvitationsEnabled: true,
    onUsersInputChange: jest.fn(),
    headerClass: '',
    footerClass: '',
    canInviteGuests: true,
    canAddUsers: true,

    customMessage: {
        message: '',
        open: false,
    },
    sending: false,
    inviteChannels: {
        channels: [],
        search: '',
    },
    usersEmails: [],
    usersEmailsSearch: '',
    townSquareDisplayName: '',
});

let props = defaultProps;

describe('InviteView', () => {
    const state = {
        entities: {
            admin: {
                prevTrialLicense: {
                    IsLicensed: 'true',
                },
            },
            general: {
                config: {
                    BuildEnterpriseReady: 'true',
                },
                license: {
                    IsLicensed: 'true',
                    Cloud: 'true',
                    Id: generateId(),
                },
            },
            cloud: {
                subscription: {
                    is_free_trial: 'false',
                    trial_end_at: 0,
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {roles: 'system_user'},
                },
            },
            roles: {
                roles: {
                    system_user: {
                        permissions: [],
                    },
                },
            },
            preferences: {
                myPreferences: {},
            },
        },
    };

    store.getState = () => (state);

    beforeEach(() => {
        props = defaultProps;
    });

    it('shows InviteAs component when user can choose to invite guests or users', () => {
        const wrapper = mountWithThemedIntl(
            <Provider store={store}>
                <InviteView {...props}/>
            </Provider>,
        );
        expect(wrapper.find(InviteAs).length).toBe(1);
    });

    it('hides InviteAs component when user can not choose members option', () => {
        props = {
            ...defaultProps,
            canAddUsers: false,
        };

        const wrapper = mountWithThemedIntl(
            <Provider store={store}>
                <InviteView {...props}/>
            </Provider>,
        );
        expect(wrapper.find(InviteAs).length).toBe(0);
    });

    it('hides InviteAs component when user can not choose guests option', () => {
        props = {
            ...defaultProps,
            canInviteGuests: false,
        };

        const wrapper = mountWithThemedIntl(
            <Provider store={store}>
                <InviteView {...props}/>
            </Provider>,
        );
        expect(wrapper.find(InviteAs).length).toBe(0);
    });
});
