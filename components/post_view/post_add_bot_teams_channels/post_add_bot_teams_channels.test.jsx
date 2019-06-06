// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Button} from 'react-bootstrap';

import * as Client from 'mattermost-redux/client';

import {shallowWithIntl, mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import AutocompleteSelector from 'components/widgets/settings/autocomplete_selector';
import PostEmoji from 'components/post_emoji';

import PostAddBotTeamsChannels from './post_add_bot_teams_channels.jsx';

jest.mock('components/post_emoji');

describe('components/post_view/PostAddBotTeamsChannels', () => {
    const post = {
        id: 'post_id_1',
        user_id: 'user_id_1',
        props: {},
    };
    const teams = [
        {
            display_name: 'Team 1',
            id: 'team_1',
        },
    ];
    const requiredProps = {
        post,
        teams,
        actions: {
            addUserToTeam: jest.fn(() => Promise.resolve()),
            addChannelMember: jest.fn(() => Promise.resolve()),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(<PostAddBotTeamsChannels {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('button changes component to add mode', () => {
        const wrapper = mountWithIntl(
            <PostAddBotTeamsChannels {...requiredProps}/>
        );

        wrapper.find(Button).simulate('click');
        expect(wrapper.state('addMode')).toBe(true);
        expect(wrapper.find('.attachment').exists()).toBe(true);
        expect(wrapper.find(AutocompleteSelector)).toHaveLength(1);
    });

    test('select team from dropdown displays channels', () => {
        const wrapper = mountWithIntl(
            <PostAddBotTeamsChannels {...requiredProps}/>
        );

        wrapper.find(Button).simulate('click');
        wrapper.instance().handleSelectedTeam({text: 'Team 1', value: 'team_1'});
        wrapper.update();

        expect(wrapper.find('.attachment').exists()).toBe(true);
        expect(wrapper.find(AutocompleteSelector)).toHaveLength(2);
    });

    test('select channel and check add action happens, message pops', async (done) => {
        const wrapper = mountWithIntl(
            <PostAddBotTeamsChannels {...requiredProps}/>
        );

        Client.Client4 = {
            updatePost: jest.fn((p) => {
                wrapper.setProps({post: p});
                Promise.resolve();
            }),
        };

        wrapper.find(Button).simulate('click');
        wrapper.instance().handleSelectedTeam({text: 'Team 1', value: 'team_1'});
        await wrapper.instance().handleSelectedChannel({id: 'channel_1', display_name: 'Channel 1'}).then(() => {
            expect(requiredProps.actions.addUserToTeam).toHaveBeenCalled();
            expect(requiredProps.actions.addUserToTeam).toHaveBeenCalledWith('team_1', post.user_id);
            expect(requiredProps.actions.addChannelMember).toHaveBeenCalled();
            expect(requiredProps.actions.addChannelMember).toHaveBeenCalledWith('channel_1', post.user_id);
        }).finally(() => {
            expect(wrapper.find(PostEmoji).exists()).toBe(true);
            done();
        });
    });
});
