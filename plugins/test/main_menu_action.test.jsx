// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MainMenu from 'components/main_menu/main_menu.jsx';

describe('plugins/MainMenuActions', () => {
    test('should match snapshot and click plugin item for main menu', () => {
        const pluginAction = jest.fn();

        const requiredProps = {
            teamId: 'someteamid',
            teamType: '',
            teamDisplayName: 'some name',
            teamName: 'somename',
            currentUser: {id: 'someuserid', roles: 'system_user'},
            enableCommands: true,
            enableCustomEmoji: true,
            enableIncomingWebhooks: true,
            enableOutgoingWebhooks: true,
            enableOAuthServiceProvider: true,
            enableUserCreation: true,
            enableEmailInvitations: false,
            showDropdown: true,
            onToggleDropdown: () => {}, //eslint-disable-line no-empty-function
            pluginMenuItems: [{id: 'someplugin', text: 'some plugin text', action: pluginAction}],
            canCreateOrDeleteCustomEmoji: true,
            moreTeamsToJoin: true,
            actions: {
                openModal: jest.fn(),
                showMentions: jest.fn(),
                showFlaggedPosts: jest.fn(),
                closeRightHandSide: jest.fn(),
                closeRhsMenu: jest.fn(),
            },
        };

        const wrapper = shallow(
            <MainMenu {...requiredProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.findWhere((node) => node.key() === 'someplugin_pluginmenuitem').props().text).toBe('some plugin text');

        wrapper.findWhere((node) => node.key() === 'someplugin_pluginmenuitem').simulate('click');
        expect(pluginAction).toBeCalled();
    });
});

