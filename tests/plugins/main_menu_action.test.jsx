// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SidebarHeaderDropdown from 'components/sidebar/header/dropdown/sidebar_header_dropdown.jsx';
import SidebarRightMenu from 'components/sidebar_right_menu/sidebar_right_menu.jsx';

describe('plugins/MainMenuActions', () => {
    test('should match snapshot and click plugin item for LHS dropdown', () => {
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
            enableOnlyAdminIntegrations: false,
            enableTeamCreation: true,
            enableUserCreation: true,
            showDropdown: true,
            onToggleDropdown: () => {}, //eslint-disable-line no-empty-function
            pluginMenuItems: [{id: 'someplugin', text: 'some plugin text', action: pluginAction}],
        };

        const wrapper = shallow(
            <SidebarHeaderDropdown {...requiredProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#someplugin_pluginmenuitem').text()).toBe('some plugin text');

        wrapper.find('#someplugin_pluginmenuitem').simulate('click');
        expect(pluginAction).toBeCalled();
    });

    test('should match snapshot and click plugin item for mobile menu', () => {
        const pluginAction = jest.fn();

        const requiredProps = {
            teamId: 'someteamid',
            isOpen: true,
            teamType: '',
            teamDisplayName: 'some name',
            showTutorialTip: false,
            enableUserCreation: true,
            pluginMenuItems: [{id: 'someplugin', text: 'some plugin text', action: pluginAction}],
            actions: {
                showMentions: () => {}, //eslint-disable-line no-empty-function
                showFlaggedPosts: () => {}, //eslint-disable-line no-empty-function
                closeRightHandSide: () => {}, //eslint-disable-line no-empty-function
                openRhsMenu: () => {}, //eslint-disable-line no-empty-function
                closeRhsMenu: () => {}, //eslint-disable-line no-empty-function
            },
        };

        const wrapper = shallow(
            <SidebarRightMenu {...requiredProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#someplugin_pluginrightmenuitem').text()).toBe('some plugin text');

        wrapper.find('#someplugin_pluginrightmenuitem').simulate('click');
        expect(pluginAction).toBeCalled();
    });
});

