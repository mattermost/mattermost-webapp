// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';
import {TeamType} from 'mattermost-redux/types/teams';

import NeedsTeam from 'components/needs_team/needs_team';

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
    isGuest: jest.fn(),
}));

describe('components/needs_team', () => {
    const history = {
        push: jest.fn(),
    };
    const teamType: TeamType = 'I';
    const teamsList = [{
        id: 'kemjcpu9bi877yegqjs18ndp4r',
        invite_id: 'ojsnudhqzbfzpk6e4n6ip1hwae',
        name: 'test',
        create_at: 123,
        update_at: 123,
        delete_at: 123,
        display_name: 'test',
        description: 'test',
        email: 'test',
        type: teamType,
        company_name: 'test',
        allowed_domains: 'test',
        allow_open_invite: false,
        scheme_id: 'test',
        group_constrained: false,
    }];

    const match = {
        params: {
            team: 'new',
        },
    };

    const teamData = {
        id: 'kemjcpu9bi877yegqjs18ndp4d',
        invite_id: 'kemjcpu9bi877yegqjs18ndp4a',
        name: 'new',
        create_at: 123,
        update_at: 123,
        delete_at: 123,
        display_name: 'test',
        description: 'test',
        email: 'test',
        type: teamType,
        company_name: 'test',
        allowed_domains: 'test',
        allow_open_invite: false,
        scheme_id: 'test',
        group_constrained: false,
    };

    const actions = {
        fetchMyChannelsAndMembers: jest.fn().mockResolvedValue({data: true}),
        getMyTeamUnreads: jest.fn(),
        viewChannel: jest.fn(),
        markChannelAsReadOnFocus: jest.fn(),
        getTeamByName: jest.fn().mockResolvedValue({data: teamData}),
        addUserToTeam: jest.fn().mockResolvedValue({data: true}),
        selectTeam: jest.fn(),
        setPreviousTeamId: jest.fn(),
        loadStatusesForChannelAndSidebar: jest.fn().mockResolvedValue({data: true}),
        loadProfilesForDirect: jest.fn().mockResolvedValue({data: true}),
    };
    const baseProps = {
        actions,
        currentUser: {
            id: 'test',
        },
        theme: {},
        mfaRequired: false,
        match,
        teamsList,
        history,
        useLegacyLHS: true,
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

        const wrapper: ShallowWrapper<any, any, NeedsTeam> = shallow(
            <NeedsTeam {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        fetchMyChannelsAndMembers().then(() => {
            expect(wrapper.state().finishedFetchingChannels).toEqual(true);
            expect(wrapper).toMatchSnapshot();
        });
    });

    it('check for addUserToTeam call if team does not exist', async () => {
        const addUserToTeam = jest.fn().mockResolvedValue({data: true});
        const newActions = {...baseProps.actions, addUserToTeam};
        const props = {...baseProps, actions: newActions};

        const wrapper: ShallowWrapper<any, any, NeedsTeam> = shallow(
            <NeedsTeam {...props}/>
        );
        expect(wrapper.state().team).toEqual(null);
        await wrapper.instance().joinTeam(props);
        expect(addUserToTeam).toHaveBeenCalledTimes(2); // called twice, first on initial mount and then on instance().joinTeam()
    });

    it('test for redirection if addUserToTeam api fails', async () => {
        const addUserToTeam = jest.fn().mockResolvedValue({error: {}});
        const newActions = {...baseProps.actions, addUserToTeam};
        const props = {...baseProps, actions: newActions};

        const wrapper: ShallowWrapper<any, any, NeedsTeam> = shallow(
            <NeedsTeam {...props}/>
        );

        expect(wrapper.state().team).toEqual(null);
        await wrapper.instance().joinTeam(props);
        expect(history.push).toBeCalledWith('/error?type=team_not_found');
    });

    it('test for team join flow with new switch', async () => {
        const addUserToTeam = jest.fn().mockResolvedValue({data: 'horray'});

        const getMyTeamUnreads = jest.fn();
        const selectTeam = jest.fn();
        const setPreviousTeamId = jest.fn();

        const newActions = {...baseProps.actions, getMyTeamUnreads, addUserToTeam, selectTeam, setPreviousTeamId};
        const props = {...baseProps, actions: newActions};

        const wrapper: ShallowWrapper<any, any, NeedsTeam> = shallow(
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
