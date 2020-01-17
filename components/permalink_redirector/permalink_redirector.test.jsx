// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import {ErrorPageTypes} from 'utils/constants';
import {browserHistory} from 'utils/browser_history';
import LocalStorageStore from 'stores/local_storage_store';
import {redirect} from 'components/permalink_redirector/actions';
import PermalinkRedirector from 'components/permalink_redirector/permalink_redirector.jsx';

const mockStore = configureStore([thunk]);

jest.mock('utils/browser_history', () => ({
    browserHistory: {
        replace: jest.fn(),
        push: jest.fn(),
    },
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

describe('components/PermalinkRedirector', () => {
    const baseProps = {
        params: {},
        actions: {
            redirect: jest.fn(),
        },
    };

    test('calls redirect for pl', async () => {
        const props = {
            ...baseProps,
            url: 'pl/post_id',
        };
        shallow(
            <PermalinkRedirector {...props}/>
        );

        expect(baseProps.actions.redirect).toHaveBeenCalledWith(props.url, props.params);
        expect(baseProps.actions.redirect).toHaveBeenCalledTimes(1);
    });

    test('calls redirect for integrations', async () => {
        const props = {
            ...baseProps,
            url: '/_redirect/integrations',
        };
        shallow(
            <PermalinkRedirector {...props}/>
        );

        expect(baseProps.actions.redirect).toHaveBeenCalledWith(props.url, props.params);
        expect(baseProps.actions.redirect).toHaveBeenCalledTimes(1);
    });

    test('calls redirect for integrations/bots', async () => {
        const props = {
            ...baseProps,
            url: '/_redirect/integrations/bots',
        };
        shallow(
            <PermalinkRedirector {...props}/>
        );

        expect(baseProps.actions.redirect).toHaveBeenCalledWith(props.url, props.params);
        expect(baseProps.actions.redirect).toHaveBeenCalledTimes(1);
    });

    describe('actions', () => {
        const initialState = {
            entities: {
                users: {
                    currentUserId: 'current_user_id',
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
                const postUrl = `pl/${postId}`;
                const teamId = 'teamId1';

                LocalStorageStore.setPreviousTeamId(
                    initialState.entities.users.currentUserId,
                    teamId,
                );

                await testStore.dispatch(redirect(`/_redirect/pl/${postId}`));

                expect(getTeam).toHaveBeenCalledWith(expect.any(Object), teamId);
                expect(browserHistory.push).toHaveBeenCalledWith(`/teamName1/${postUrl}`);
            });

            test('error null team', async () => {
                const testStore = await mockStore(initialState);
                const postId = 'bad';
                const teamId = 'teamId3';
                LocalStorageStore.setPreviousTeamId(
                    initialState.entities.users.currentUserId,
                    teamId,
                );

                await testStore.dispatch(redirect(postId));

                expect(getTeam).toHaveBeenCalledWith(expect.any(Object), teamId);
                expect(browserHistory.push).toHaveBeenCalledTimes(0);
                expect(browserHistory.replace).toHaveBeenCalledTimes(1);
                expect(browserHistory.replace).toHaveBeenCalledWith(`/error?type=${ErrorPageTypes.TEAM_NOT_FOUND}`);
            });
        });
    });
});
