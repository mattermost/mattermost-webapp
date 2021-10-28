// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InstalledCommand from 'components/integrations/installed_command';
import {Command} from 'mattermost-redux/types/integrations';
import test_helper from 'packages/mattermost-redux/test/test_helper';
import {TeamType} from 'packages/mattermost-redux/src/types/teams';
import {UserNotifyProps, UserProfile} from 'mattermost-redux/types/users';

describe('components/integrations/InstalledCommand', () => {
    const fakeTeam = test_helper.fakeTeamWithId();
    const team = {
        ...fakeTeam,
        name: 'team_name',
        teamId: 'testteamid',
        description: 'team description',
        type: 'O' as TeamType,
        company_name: 'Company Name',
        allow_open_invite: false,
        group_constrained: false,
    };
    const command: Command = {
        id: 'r5tpgt4iepf45jt768jz84djic',
        display_name: 'display_name',
        description: 'description',
        trigger: 'trigger',
        auto_complete: true,
        auto_complete_hint: 'auto_complete_hint',
        auto_complete_desc: 'auto_complete_desc',
        token: 'testToken',
        create_at: 1499722850203,
        creator_id: '88oybd1dwfdoxpkpw1h5kpbyco',
        delete_at: 0,
        icon_url: 'https://google.com/icon',
        method: 'G' as ('P' | 'G' | ''),
        team_id: 'm5gix3oye3du8ghk4ko6h9cq7y',
        update_at: 1504468859001,
        url: 'https://google.com/command',
        username: 'username',
    };
    const fakeUser = test_helper.fakeUserWithId();
    const creator: UserProfile = {
        ...fakeUser,
        username: 'username',
        auth_data: '',
        auth_service: '',
        email_verified: true,
        nickname: 'The',
        position: '',
        props: {},
        notify_props: {} as UserNotifyProps,
        last_password_update: 0,
        last_picture_update: 0,
        failed_attempts: 0,
        mfa_active: false,
        mfa_secret: '',
        last_activity_at: 0,
        is_bot: true,
        bot_description: 'tester bot',
        bot_last_icon_update: 0,
        terms_of_service_id: '',
        terms_of_service_create_at: 0,
    };
    const requiredProps = {
        team,
        command,
        onRegenToken: jest.fn(),
        onDelete: jest.fn(),
        creator,
        canChange: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<InstalledCommand {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();

        const trigger = `- /${command.trigger} ${command.auto_complete_hint}`;
        expect(wrapper.find('.item-details__trigger').text()).toBe(trigger);
        expect(wrapper.find('.item-details__name').text()).toBe(command.display_name);
        expect(wrapper.find('.item-details__description').text()).toBe(command.description);
    });

    test('should match snapshot, not autocomplete, no display_name/description/auto_complete_hint', () => {
        const minCommand = {
            ...command,
            id: 'r5tpgt4iepf45jt768jz84djic',
            trigger: 'trigger',
            auto_complete: false,
            token: 'testToken',
            create_at: 1499722850203,
        };
        const props = {...requiredProps, command: minCommand};

        const wrapper = shallow(<InstalledCommand {...props}/>);
        expect(wrapper).toMatchSnapshot();

        const trigger = `- /${command.trigger}`;
        expect(wrapper.find('.item-details__trigger').text()).toBe(trigger);
    });

    test('should call onRegenToken function', () => {
        const onRegenToken = jest.fn();
        const canChange = true;
        const props = {...requiredProps, onRegenToken, canChange};

        const wrapper = shallow(<InstalledCommand {...props}/>);
        expect(wrapper).toMatchSnapshot();

        wrapper.find('div.item-actions button').first().simulate('click', {preventDefault: jest.fn()});
        expect(onRegenToken).toHaveBeenCalledTimes(1);
        expect(onRegenToken).toHaveBeenCalledWith(props.command);
    });

    test('should call onDelete function', () => {
        const onDelete = jest.fn();
        const canChange = true;
        const props = {...requiredProps, onDelete, canChange};

        const wrapper = shallow<InstalledCommand>(<InstalledCommand {...props}/>);
        expect(wrapper).toMatchSnapshot();
        const instance = wrapper.instance() as any as InstanceType<typeof InstalledCommand>;

        instance.handleDelete();
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith(props.command);
    });

    test('should filter out command', () => {
        const filter = 'no_match';
        const props = {...requiredProps, filter};

        const wrapper = shallow(<InstalledCommand {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
