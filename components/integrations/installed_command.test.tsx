// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InstalledCommand from 'components/integrations/installed_command';
import {Command} from 'mattermost-redux/types/integrations';
import {Team} from 'packages/mattermost-redux/src/types/teams';
import {UserProfile} from 'mattermost-redux/types/users';
import {TestHelper} from '../../utils/test_helper';

describe('components/integrations/InstalledCommand', () => {
    const team: Team = TestHelper.getTeamMock();

    const command: Command = TestHelper.getCommandMock({
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
    });
    const creator: UserProfile = TestHelper.getUserMock();
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

        wrapper.instance().handleDelete();
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
