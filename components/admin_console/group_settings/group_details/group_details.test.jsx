// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GroupDetails from 'components/admin_console/group_settings/group_details/group_details.jsx';

describe('components/admin_console/group_settings/group_details/GroupDetails', () => {
    const defaultProps = {
        groupID: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
        group: {
            display_name: 'Group',
            name: 'Group',
        },
        groupTeams: [
            {team_id: '11111111111111111111111111'},
            {team_id: '22222222222222222222222222'},
            {team_id: '33333333333333333333333333'},
        ],
        groupChannels: [
            {channel_id: '44444444444444444444444444'},
            {channel_id: '55555555555555555555555555'},
            {channel_id: '66666666666666666666666666'},
        ],
        members: [
            {id: '77777777777777777777777777'},
            {id: '88888888888888888888888888'},
            {id: '99999999999999999999999999'},
        ],
        memberCount: 20,
        actions: {
            getGroup: jest.fn().mockReturnValue(Promise.resolve()),
            getMembers: jest.fn().mockReturnValue(Promise.resolve()),
            getGroupSyncables: jest.fn().mockReturnValue(Promise.resolve()),
            link: jest.fn(),
            unlink: jest.fn(),
            patchGroup: jest.fn(),
            patchGroupSyncable: jest.fn(),
            setNavigationBlocked: jest.fn(),
        },
    };

    test('should match snapshot, with everything closed', () => {
        const wrapper = shallow(<GroupDetails {...defaultProps}/>);
        defaultProps.actions.getGroupSyncables.mockClear();
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with add team selector open', () => {
        const wrapper = shallow(<GroupDetails {...defaultProps}/>);
        wrapper.setState({addTeamOpen: true});
        defaultProps.actions.getGroupSyncables.mockClear();
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with add channel selector open', () => {
        const wrapper = shallow(<GroupDetails {...defaultProps}/>);
        wrapper.setState({addChannelOpen: true});
        defaultProps.actions.getGroupSyncables.mockClear();
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with loaded state', () => {
        const wrapper = shallow(<GroupDetails {...defaultProps}/>);
        wrapper.setState({loading: false, loadingTeamsAndChannels: false});
        defaultProps.actions.getGroupSyncables.mockClear();
        expect(wrapper).toMatchSnapshot();
    });

    test('should load data on mount', () => {
        const actions = {
            getGroupSyncables: jest.fn().mockReturnValue(Promise.resolve()),
            getGroup: jest.fn().mockReturnValue(Promise.resolve()),
            getMembers: jest.fn(),
            link: jest.fn(),
            unlink: jest.fn(),
            patchGroup: jest.fn(),
            patchGroupSyncable: jest.fn(),
            setNavigationBlocked: jest.fn(),
        };
        shallow(
            <GroupDetails
                {...defaultProps}
                actions={actions}
            />,
        );
        expect(actions.getGroupSyncables).toBeCalledWith('xxxxxxxxxxxxxxxxxxxxxxxxxx', 'team');
        expect(actions.getGroupSyncables).toBeCalledWith('xxxxxxxxxxxxxxxxxxxxxxxxxx', 'channel');
        expect(actions.getGroupSyncables).toBeCalledTimes(2);
        expect(actions.getGroup).toBeCalledWith('xxxxxxxxxxxxxxxxxxxxxxxxxx');
    });

    test('should set state for each channel when addChannels is called', async () => {
        const actions = {
            getGroupSyncables: jest.fn().mockReturnValue(Promise.resolve()),
            getGroup: jest.fn().mockReturnValue(Promise.resolve()),
            getMembers: jest.fn(),
            link: jest.fn().mockReturnValue(Promise.resolve()),
            unlink: jest.fn().mockReturnValue(Promise.resolve()),
            patchGroup: jest.fn(),
            patchGroupSyncable: jest.fn(),
            setNavigationBlocked: jest.fn(),
        };
        const wrapper = shallow(
            <GroupDetails
                {...defaultProps}
                actions={actions}
            />,
        );
        const instance = wrapper.instance();
        await instance.addChannels([{id: '11111111111111111111111111'}, {id: '22222222222222222222222222'}]);
        const testStateObj = (stateSubset) => {
            const channelIDs = stateSubset.map((gc) => gc.channel_id);
            expect(channelIDs).toContain('11111111111111111111111111');
            expect(channelIDs).toContain('22222222222222222222222222');
        };
        testStateObj(instance.state.groupChannels);
        testStateObj(instance.state.channelsToAdd);
    });

    test('should set state for each team when addTeams is called', async () => {
        const actions = {
            getGroupSyncables: jest.fn().mockReturnValue(Promise.resolve()),
            getGroup: jest.fn().mockReturnValue(Promise.resolve()),
            getMembers: jest.fn(),
            link: jest.fn().mockReturnValue(Promise.resolve()),
            unlink: jest.fn().mockReturnValue(Promise.resolve()),
            patchGroup: jest.fn(),
            patchGroupSyncable: jest.fn(),
            setNavigationBlocked: jest.fn(),
        };
        const wrapper = shallow(
            <GroupDetails
                {...defaultProps}
                actions={actions}
            />,
        );
        const instance = wrapper.instance();
        expect(instance.state.groupTeams.length === 0);
        instance.addTeams([{id: '11111111111111111111111111'}, {id: '22222222222222222222222222'}]);
        const testStateObj = (stateSubset) => {
            const teamIDs = stateSubset.map((gt) => gt.team_id);
            expect(teamIDs).toContain('11111111111111111111111111');
            expect(teamIDs).toContain('22222222222222222222222222');
        };
        testStateObj(instance.state.groupTeams);
        testStateObj(instance.state.teamsToAdd);
    });

    test('update name for null slug', async () => {
        const wrapper = shallow(
            <GroupDetails
                {...defaultProps}
                group={{display_name: 'test group', allow_reference: false}}
            />,
        );

        wrapper.instance().onMentionToggle(true);
        expect(wrapper.state().groupMentionName).toBe('test-group');
    });

    test('update name for empty slug', async () => {
        const wrapper = shallow(
            <GroupDetails
                {...defaultProps}
                group={{name: '', display_name: 'test group', allow_reference: false}}
            />,
        );

        wrapper.instance().onMentionToggle(true);
        expect(wrapper.state().groupMentionName).toBe('test-group');
    });

    test('Should not update name for slug', async () => {
        const wrapper = shallow(
            <GroupDetails
                {...defaultProps}
                group={{name: 'any_name_at_all', display_name: 'test group', allow_reference: false}}
            />,
        );
        wrapper.instance().onMentionToggle(true);
        expect(wrapper.state().groupMentionName).toBe('any_name_at_all');
    });
});
