// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow, ShallowWrapper} from 'enzyme';
import React from 'react';
import {TeamType} from 'mattermost-redux/types/teams';
import {ChannelType} from 'mattermost-redux/types/channels';

import {createMemoryHistory, createLocation} from 'history';
import {match as RouterMatch} from 'react-router';

import CreateTeam from 'components/create_team/create_team';

jest.mock('components/announcement_bar');
jest.mock('components/common/back_button');
jest.mock('react-router-dom');

const history = createMemoryHistory();
const path = '/route/:id';

const match: RouterMatch<{ id: string }> = {
    isExact: false,
    path,
    url: path.replace(':id', '1'),
    params: {id: '1'}
};

const location = createLocation(match.url);

describe('/components/create_team', () => {
    const defaultProps = {
        currentChannel: {
            id: '1',
            team_id: '1',
            type: 'O' as ChannelType,
            create_at: 1,
            update_at: 2,
            delete_at: 0,
            display_name: 'test',
            name: 'test-channel',
            header: 'a',
            purpose: 'a',
            last_post_at: 1,
            total_msg_count: 1,
            extra_update_at: 1,
            creator_id: 'a',
            scheme_id: 'a',
            group_constrained: false
        },
        currentTeam: {
            id: '1',
            create_at: 1,
            update_at: 2,
            delete_at: 0,
            display_name: 'test',
            name: 'test-team',
            description: 'a',
            email: 'a@gmail.com',
            type: 'O' as TeamType,
            company_name: 'mattermost',
            allowed_domains: 'a',
            invite_id: 'a',
            allow_open_invite: true,
            scheme_id: 'a',
            group_constrained: false
        },
        siteName: 'Mattermost',
        customBrand: true,
        enableCustomBrand: true,
        customDescriptionText: 'Welcome to our custom branded site!',
        match,
        history,
        location
    };

    test('should match snapshot', () => {
        const wrapper: ShallowWrapper<any, any, CreateTeam> = shallow(
            <CreateTeam {...defaultProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should run props.history.push with new state', () => {
        const wrapper: ShallowWrapper<any, any, CreateTeam> = shallow(
            <CreateTeam {...defaultProps}/>
        );

        const pushSpy = jest.spyOn(history, 'push');
        const state = {team: {name: 'team_name'}, wizard: ''};
        wrapper.setState(state);

        state.team.name = 'new_team';
        state.wizard = 'display_name';
        wrapper.instance().updateParent(state);

        expect(state.team.name).toBe('new_team');
        expect(pushSpy).toHaveBeenCalledWith('/create_team/display_name');
    });
});
