// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import NeedsTeam from 'components/needs_team/needs_team.jsx';

jest.mock('actions/global_actions.jsx', () => ({
    emitCloseRightHandSide: jest.fn(),
}));

jest.mock('actions/post_actions.jsx', () => ({
    stopPeriodicStatusUpdates: jest.fn(),
    startPeriodicStatusUpdates: jest.fn(),
    loadStatusesForChannelAndSidebar: jest.fn(),
}));

jest.mock('actions/post_actions.jsx', () => ({
    startPeriodicSync: jest.fn(),
    stopPeriodicSync: jest.fn(),
    reconnect: jest.fn(),
}));

jest.mock('utils/utils', () => ({
    applyTheme: jest.fn(),
    localizeMessage: jest.fn(),
    areObjectsEqual: jest.fn(),
}));

function emptyFunction() {} //eslint-disable-line no-empty-function

const actionsProp = {
    fetchMyChannelsAndMembers: jest.fn(() => {
        return new Promise((resolve) => {
            process.nextTick(() => resolve());
        });
    }),
    getMyTeamUnreads: emptyFunction,
    viewChannel: emptyFunction,
    markChannelAsRead: emptyFunction,
    getTeams: emptyFunction,
    joinTeam: emptyFunction,
    selectTeam: emptyFunction,
    setGlobalItem: emptyFunction,
};

const teamsList = [{
    id: 'kemjcpu9bi877yegqjs18ndp4r',
    invite_id: 'ojsnudhqzbfzpk6e4n6ip1hwae',
    name: 'test',
}];

const match = {
    params: {
        team: 'new',
    },
};

const getTeams = async () => {
    return {
        data: [
            ...teamsList,
            {
                id: 'kemjcpu9bi877yegqjs18ndp4d',
                invite_id: 'kemjcpu9bi877yegqjs18ndp4a',
                name: 'new',
            },
        ],
    };
};

const history = {
    push: jest.fn(),
};

describe('components/needs_team', () => {
    it('should match snapshots for init with existing team', () => {
        const fetchMyChannelsAndMembers = () => Promise.resolve();

        const existingTeamMatch = {
            params: {
                team: 'test',
            },
        };

        const wrapper = shallow(
            <NeedsTeam
                actions={{
                    ...actionsProp,
                    fetchMyChannelsAndMembers,
                }}
                theme={{}}
                mfaRequired={false}
                match={existingTeamMatch}
                teamsList={teamsList}
                history={history}
            />
        );
        expect(wrapper).toMatchSnapshot();
        fetchMyChannelsAndMembers().then(() => {
            wrapper.update();
            expect(wrapper.state().finishedFetchingChannels).toEqual(true);
            expect(wrapper).toMatchSnapshot();
        });
    });

    it('check for joinTeam call if team does not exist', async () => {
        const joinTeam = jest.fn();

        const wrapper = shallow(
            <NeedsTeam
                actions={{
                    ...actionsProp,
                    getTeams,
                    joinTeam,
                }}
                theme={{}}
                mfaRequired={false}
                match={match}
                teamsList={teamsList}
                history={history}
            />
        );
        expect(wrapper.state().team).toEqual(null);
        await getTeams();
        expect(joinTeam).toHaveBeenCalledTimes(1);
        wrapper.update();
    });

    it('test for redirection if joinTeam api fails', async () => {
        const joinTeam = async () => {
            return {
                error: {},
            };
        };

        const wrapper = shallow(
            <NeedsTeam
                actions={{
                    ...actionsProp,
                    getTeams,
                    joinTeam,
                }}
                theme={{}}
                mfaRequired={false}
                match={match}
                teamsList={teamsList}
                history={history}
            />
        );
        expect(wrapper.state().team).toEqual(null);
        await getTeams();
        await joinTeam();
        expect(history.push).toBeCalledWith('/error?type=team_not_found');
    });

    it('test for team join flow with new switch', async () => {
        const joinTeam = async () => {
            return {
                data: 'horray',
            };
        };

        const getMyTeamUnreads = jest.fn();
        const selectTeam = jest.fn();
        const setGlobalItem = jest.fn();

        const wrapper = shallow(
            <NeedsTeam
                actions={{
                    ...actionsProp,
                    getTeams,
                    joinTeam,
                    getMyTeamUnreads,
                    selectTeam,
                    setGlobalItem,
                }}
                theme={{}}
                mfaRequired={false}
                match={match}
                teamsList={teamsList}
                history={history}
            />
        );

        expect(wrapper.state().team).toEqual(null);
        await getTeams();
        await joinTeam();

        wrapper.update();
        expect(wrapper.state().team.name).toEqual('new');
        expect(selectTeam).toBeCalledWith(wrapper.state().team);
        expect(getMyTeamUnreads).toHaveBeenCalledTimes(1);
        expect(setGlobalItem).toBeCalledWith('team', wrapper.state().team.id);

        const existingTeamMatch = {
            params: {
                team: 'test',
            },
        };

        // team change and team exists
        wrapper.setProps({match: existingTeamMatch});
        wrapper.update();

        const newTeamMatch = {
            params: {
                team: 'test1',
            },
        };

        wrapper.setProps({match: newTeamMatch});
        wrapper.update();
        expect(wrapper.state().team).toEqual(null);
    });
});
