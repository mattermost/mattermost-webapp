// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import ProfilePopover from 'components/profile_popover/profile_popover';
import Pluggable from '../../plugins/pluggable';

describe('components/ProfilePopover', () => {
    const baseProps = {
        user: {
            name: 'some name',
            username: 'some_username',
        },
        hide: jest.fn(),
        src: 'src',
        currentUserId: '',
        currentTeamId: 'team_id',
        isChannelAdmin: false,
        isTeamAdmin: false,
        isInCurrentTeam: true,
        teamUrl: '',
        canManageAnyChannelMembersInCurrentTeam: true,
        actions: {
            getMembershipForCurrentEntities: jest.fn(),
            openDirectChannelToUserId: jest.fn(),
            openModal: jest.fn(),
            closeModal: jest.fn(),
            loadBot: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const props = {...baseProps};

        const wrapper = shallowWithIntl(
            <ProfilePopover {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should have bot description', () => {
        const props = {
            ...baseProps,
            user: {
                is_bot: true,
                bot_description: 'bot description',
            },
        };

        const wrapper = shallowWithIntl(
            <ProfilePopover {...props}/>,
        );
        expect(wrapper.containsMatchingElement(
            <div
                key='bot-description'
            >
                {'bot description'}
            </div>,
        )).toEqual(true);
    });

    test('should hide add-to-channel option if not on team', () => {
        const props = {...baseProps};
        props.isInCurrentTeam = false;

        const wrapper = shallowWithIntl(
            <ProfilePopover {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match props passed into Pluggable component', () => {
        const hide = jest.fn();
        const status = 'online';
        const props = {...baseProps, hide, status};

        const wrapper = shallowWithIntl(
            <ProfilePopover {...props}/>,
        );

        const pluggableProps = {
            hide,
            status,
            user: props.user,
        };
        expect(wrapper.find(Pluggable).first().props()).toEqual({...pluggableProps, pluggableName: 'PopoverUserAttributes'});
        expect(wrapper.find(Pluggable).last().props()).toEqual({...pluggableProps, pluggableName: 'PopoverUserActions'});
    });
});
