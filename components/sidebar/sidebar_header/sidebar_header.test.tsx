// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import IconButton from '@mattermost/compass-components/components/icon-button';

import AddChannelDropdown from '../add_channel_dropdown';

import SidebarHeader, {Props} from './sidebar_header';

let props: Props;

const mockDispatch = jest.fn();
let mockState: any;

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));

describe('Components/SidebarHeader', () => {
    beforeEach(() => {
        props = {
            showNewChannelModal: jest.fn(),
            showMoreChannelsModal: jest.fn(),
            invitePeopleModal: jest.fn(),
            showCreateCategoryModal: jest.fn(),
            canCreateChannel: true,
            canJoinPublicChannel: true,
            handleOpenDirectMessagesModal: jest.fn(),
            unreadFilterEnabled: true,
            showCreateUserGroupModal: jest.fn(),
            userGroupsEnabled: false,
            canCreateCustomGroups: true,
        };

        mockState = {
            entities: {
                general: {
                    config: {},
                },
                preferences: {
                    myPreferences: {},
                },
                teams: {
                    currentTeamId: 'currentteam',
                    teams: {
                        currentteam: {
                            id: 'currentteam',
                            description: 'et iste illum reprehenderit aliquid in rem itaque in maxime eius.',
                        },
                    },
                },
                users: {
                    currentUserId: 'uid',
                },
            },
            views: {
                addChannelDropdown: {
                    isOpen: false,
                },
            },
        };
    });

    it('should show AddChannelDropdown', () => {
        const wrapper = shallow(<SidebarHeader {...props}/>);
        expect(wrapper.find(AddChannelDropdown).length).toBe(1);
    });

    it('should embed teams menu dropdown into heading', () => {
        const wrapper = shallow(<SidebarHeader {...props}/>);
        expect(wrapper.find(IconButton).length).toBe(0);
        expect(wrapper.find('i').prop('className')).toBe('icon icon-chevron-down');
    });
});
