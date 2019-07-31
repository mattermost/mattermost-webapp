// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {getPost} from 'mattermost-redux/actions/posts';
import {getChannel} from 'mattermost-redux/actions/channels';
import {getTeam as getTeamSelector} from 'mattermost-redux/selectors/entities/teams';
import {getTeam} from 'mattermost-redux/actions/teams';

import {redirectUserToDefaultTeam} from 'actions/global_actions.jsx';

import {ErrorPageTypes} from 'utils/constants.jsx';
import {browserHistory} from 'utils/browser_history';
import LocalStorageStore from 'stores/local_storage_store';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import {redirect} from 'components/permalink_redirector/actions';
import PermalinkRedirector from 'components/permalink_redirector/permalink_redirector.jsx';

const mockStore = configureStore([thunk]);

jest.mock('actions/global_actions.jsx', () => ({
    redirectUserToDefaultTeam: jest.fn().mockReturnValue({type: 'd'}),
}));

jest.mock('utils/browser_history', () => ({
    browserHistory: {
        replace: jest.fn(),
        push: jest.fn(),
    },
}));

jest.mock('mattermost-redux/actions/posts', () => ({
    getPost: jest.fn((postId) => {
        const dmPost = {id: 'dmpostid1', message: 'some message', channel_id: 'dmchannelid'};
        const gmPost = {id: 'gmpostid1', message: 'some message', channel_id: 'gmchannelid'};
        const nullPost = {id: 'gmpostid1', message: 'some message', channel_id: 'nullchannel'};
        const badPost = {id: 'gmpostid1', message: 'some message', channel_id: 'badchannel'};

        switch (postId) {
        case 'dmpostid1':
            return {type: 'MOCK_GET_POST', data: dmPost};
        case 'gmpostid1':
            return {type: 'MOCK_GET_POST', data: gmPost};
        case 'null':
            return {type: 'MOCK_GET_POST', data: nullPost};
        default:
            return {type: 'MOCK_GET_POST', data: badPost};
        }
    }),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    ...jest.requireActual('mattermost-redux/actions/channels'),
    getChannel: jest.fn((channelId) => {
        const dmPostChannel = {type: 'D'};
        const gmPostChannel = {team_id: 'teamId2', type: 'testChannelType'};
        const badChannel = {team_id: 'teamId3', type: 'D'};

        switch (channelId) {
        case 'dmchannelid':
            return {type: 'MOCK_GET_POST', data: dmPostChannel};
        case 'gmchannelid':
            return {type: 'MOCK_GET_POST', data: gmPostChannel};
        case 'nullchannel':
            return {type: 'MOCK_GET_POST', error: 'error'};
        default:
            return {type: 'MOCK_GET_POST', data: badChannel};
        }
    }),
}));

jest.mock('mattermost-redux/selectors/entities/teams', () => ({
    ...jest.requireActual('mattermost-redux/selectors/entities/teams'),
    getTeam: jest.fn((state, teamId) => {
        switch (teamId) {
        case 'teamId1':
            return {name: 'teamName1'};
        case 'teamId2':
            return {name: 'teamName2'};
        default:
            return null;
        }
    }),
}));

jest.mock('mattermost-redux/actions/teams', () => ({
    ...jest.requireActual('mattermost-redux/actions/teams'),
    getTeam: jest.fn((teamId) => {
        switch (teamId) {
        case 'teamId1':
            return {type: 't', data: {name: 'teamName1'}};
        case 'teamId2':
            return {type: 't', data: {name: 'teamName2'}};
        default:
            return {type: 't'};
        }
    }),
}));

describe('components/PermalinkRedirector', () => {
    const baseProps = {
        postId: 'post_id',
        actions: {
            redirect: jest.fn(),
        },
    };

    test('calls action', async () => {
        shallowWithIntl(
            <PermalinkRedirector {...baseProps}/>
        );

        expect(baseProps.actions.redirect).toHaveBeenCalledWith('post_id');
        expect(baseProps.actions.redirect).toHaveBeenCalledTimes(1);
    });

    describe('actions', () => {
        const initialState = {
            entities: {
                users: {
                    currentUserId: 'current_user_id',
                },
                channels: {
                    channels: {
                        channelid1: {id: 'channelid1', name: 'channel1', type: 'O', team_id: 'current_team_id'},
                        dmchannelid: {id: 'dmchannelid', name: 'dmchannel', type: 'D'},
                        gmchannelid: {id: 'gmchannelid', name: 'gmchannel', type: 'G'},
                    },
                    myMembers: {channelid1: {channel_id: 'channelid1', user_id: 'current_user_id'}},
                },
                teams: {
                    currentTeamId: 'current_team_id',
                },
            },
        };

        describe('redirect', () => {
            test('to the default team', async () => {
                const testStore = await mockStore(initialState);
                const postId = 'dmpostid1';
                const channelId = 'dmchannelid';
                const teamId = 'teamId1';

                LocalStorageStore.setPreviousTeamId(
                    initialState.entities.users.currentUserId,
                    teamId,
                );

                await testStore.dispatch(redirect(postId));

                expect(getPost).toHaveBeenCalledWith(postId);
                expect(getChannel).toHaveBeenCalledWith(channelId);
                expect(getTeamSelector).toHaveBeenCalledWith(expect.any(Object), teamId);

                expect(browserHistory.push).toHaveBeenCalledWith(`/teamName1/pl/${postId}`);
            });

            test('to a specific team', async () => {
                const testStore = await mockStore(initialState);
                const postId = 'gmpostid1';
                const channelId = 'gmchannelid';
                const teamId = 'teamId2';

                LocalStorageStore.setPreviousTeamId(
                    initialState.entities.users.currentUserId,
                    teamId,
                );

                await testStore.dispatch(redirect(postId));

                expect(getPost).toHaveBeenCalledWith(postId);
                expect(getChannel).toHaveBeenCalledWith(channelId);
                expect(getTeam).toHaveBeenCalledWith(teamId);

                expect(browserHistory.push).toHaveBeenCalledWith(`/teamName2/pl/${postId}`);
            });

            test('error null team', async () => {
                const testStore = await mockStore(initialState);
                const postId = 'bad';
                const channelId = 'badchannel';
                const teamId = 'teamId3';
                LocalStorageStore.setPreviousTeamId(
                    initialState.entities.users.currentUserId,
                    teamId,
                );

                await testStore.dispatch(redirect(postId));

                expect(getPost).toHaveBeenCalledWith(postId);
                expect(getChannel).toHaveBeenCalledWith(channelId);
                expect(getTeamSelector).toHaveBeenCalledWith(expect.any(Object), teamId);

                expect(redirectUserToDefaultTeam).toHaveBeenCalledTimes(1);
                expect(browserHistory.push).toHaveBeenCalledTimes(0);
                expect(browserHistory.replace).toHaveBeenCalledTimes(0);
            });

            test('error null channel', async () => {
                const testStore = await mockStore(initialState);
                const postId = 'null';
                const channelId = 'nullchannel';

                await testStore.dispatch(redirect(postId));

                expect(getPost).toHaveBeenCalledWith(postId);
                expect(getChannel).toHaveBeenCalledWith(channelId);
                expect(getTeamSelector).toHaveBeenCalledTimes(0);

                expect(browserHistory.push).toHaveBeenCalledTimes(0);
                expect(browserHistory.replace).toHaveBeenCalledWith(`/error?type=${ErrorPageTypes.TEAM_NOT_FOUND}`);
            });
        });
    });
});
