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

describe('components/needs_team', () => {
    const history = {
        push: jest.fn(),
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

    const teamData = [
        ...teamsList,
        {
            id: 'kemjcpu9bi877yegqjs18ndp4d',
            invite_id: 'kemjcpu9bi877yegqjs18ndp4a',
            name: 'new',
        },
    ];

    const actions = {
        fetchMyChannelsAndMembers: jest.fn().mockResolvedValue({data: true}),
        getMyTeamUnreads: jest.fn(),
        viewChannel: jest.fn(),
        markChannelAsRead: jest.fn(),
        getTeams: jest.fn().mockResolvedValue({data: teamData}),
        joinTeam: jest.fn().mockResolvedValue({data: true}),
        selectTeam: jest.fn(),
        setPreviousTeamId: jest.fn(),
        loadStatusesForChannelAndSidebar: jest.fn(),
    };
    const baseProps = {
        actions,
        theme: {},
        mfaRequired: false,
        match,
        teamsList,
        history,
    };
    it('should match snapshots for init with existing team', () => {
        const fetchMyChannelsAndMembers = jest.fn().mockResolvedValue({data: true});

        const existingTeamMatch = {
            params: {
                team: 'test',
            },
        };

        const newActions = {...baseProps.actions, fetchMyChannelsAndMembers};
        const props = {...baseProps, actions: newActions, match: existingTeamMatch};

        const wrapper = shallow(
            <NeedsTeam {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        fetchMyChannelsAndMembers().then(() => {
            expect(wrapper.state().finishedFetchingChannels).toEqual(true);
            expect(wrapper).toMatchSnapshot();
        });
    });

    it('check for joinTeam call if team does not exist', async () => {
        const joinTeam = jest.fn().mockResolvedValue({data: true});
        const newActions = {...baseProps.actions, joinTeam};
        const props = {...baseProps, actions: newActions};

        const wrapper = shallow(
            <NeedsTeam {...props}/>
        );
        expect(wrapper.state().team).toEqual(null);
        await wrapper.instance().joinTeam(props);
        expect(joinTeam).toHaveBeenCalledTimes(2); // called twice, first on initial mount and then on instance().joinTeam()
    });

    it('test for redirection if joinTeam api fails', async () => {
        const joinTeam = jest.fn().mockResolvedValue({error: {}});
        const newActions = {...baseProps.actions, joinTeam};
        const props = {...baseProps, actions: newActions};

        const wrapper = shallow(
            <NeedsTeam {...props}/>
        );

        expect(wrapper.state().team).toEqual(null);
        await wrapper.instance().joinTeam(props);
        expect(history.push).toBeCalledWith('/error?type=team_not_found');
    });

    it('test for team join flow with new switch', async () => {
        const joinTeam = jest.fn().mockResolvedValue({data: 'horray'});

        const getMyTeamUnreads = jest.fn();
        const selectTeam = jest.fn();
        const setPreviousTeamId = jest.fn();

        const newActions = {...baseProps.actions, getMyTeamUnreads, joinTeam, selectTeam, setPreviousTeamId};
        const props = {...baseProps, actions: newActions};

        const wrapper = shallow(
            <NeedsTeam {...props}/>
        );

        expect(wrapper.state().team).toEqual(null);
        await wrapper.instance().joinTeam(props);

        expect(wrapper.state().team.name).toEqual('new');
        expect(selectTeam).toBeCalledWith(wrapper.state().team);
        expect(getMyTeamUnreads).toHaveBeenCalledTimes(2); // called twice, first on initial mount and then on instance().joinTeam()
        expect(setPreviousTeamId).toBeCalledWith(wrapper.state().team.id);

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
