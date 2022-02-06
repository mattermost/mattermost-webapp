// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import * as redux from 'react-redux';
import {shallow} from 'enzyme';
import IconButton from '@mattermost/compass-components/components/icon-button';

import {TutorialSteps} from 'utils/constants';

import AddChannelDropdown from '../add_channel_dropdown';

import SidebarHeader, {Props} from './sidebar_header';

let props: Props;

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
        };
    });

    const mockRedux = () => {
        const spy = jest.spyOn(redux, 'useSelector');

        // team
        spy.mockReturnValueOnce({});

        // user
        spy.mockReturnValueOnce({});

        // tip step
        spy.mockReturnValueOnce(TutorialSteps.MENU_POPOVER);

        // channels by name
        spy.mockReturnValueOnce({});
    };

    it('should show AddChannelDropdown', () => {
        mockRedux();

        const wrapper = shallow(<SidebarHeader {...props}/>);
        expect(wrapper.find(AddChannelDropdown).length).toBe(1);
    });

    it('should embed teams menu dropdown into heading', () => {
        mockRedux();

        const wrapper = shallow(<SidebarHeader {...props}/>);
        expect(wrapper.find(IconButton).length).toBe(0);
        expect(wrapper.find('i').prop('className')).toBe('icon icon-chevron-down');
    });
});
