// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import * as redux from 'react-redux';
import {shallow} from 'enzyme';
import IconButton from '@mattermost/compass-components/components/icon-button';

import {AddChannelButtonTreatments} from 'mattermost-redux/constants/config';
import {TutorialSteps} from 'utils/constants';

import AddChannelDropdown from '../add_channel_dropdown';

import SidebarHeader, {Props} from './sidebar_header';

let props: Props;

function mockTreatment(treatment?: AddChannelButtonTreatments) {
    const spy = jest.spyOn(redux, 'useSelector');

    // team
    spy.mockReturnValueOnce({});

    // user
    spy.mockReturnValueOnce({});

    // tip step
    spy.mockReturnValueOnce(TutorialSteps.MENU_POPOVER);

    // treatment
    spy.mockReturnValueOnce(treatment);

    // channels by name
    spy.mockReturnValueOnce({});
}

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

    it('should not show AddChannelDropdown when there is no A/B treatment', () => {
        mockTreatment(AddChannelButtonTreatments.NONE);
        const wrapper = shallow(<SidebarHeader {...props}/>);
        expect(wrapper.find(AddChannelDropdown).length).toBe(0);
    });

    it('should not show AddChannelDropdown when A/B treatment is unknown', () => {
        mockTreatment();
        const wrapper = shallow(<SidebarHeader {...props}/>);
        expect(wrapper.find(AddChannelDropdown).length).toBe(0);
    });

    it('should show AddChannelDropdown when there is an active A/B treatment', () => {
        mockTreatment(AddChannelButtonTreatments.BY_TEAM_NAME);

        const wrapper = shallow(<SidebarHeader {...props}/>);
        expect(wrapper.find(AddChannelDropdown).length).toBe(1);
    });

    it('should show separate teams menu button with no add channel button A/B treatment', () => {
        mockTreatment();
        const wrapper = shallow(<SidebarHeader {...props}/>);
        expect(wrapper.find(IconButton).prop('icon')).toBe('dots-vertical');
    });

    it('should embed teams menu dropdown into heading when there is an A/B treatment', () => {
        mockTreatment(AddChannelButtonTreatments.BY_TEAM_NAME);
        const wrapper = shallow(<SidebarHeader {...props}/>);
        expect(wrapper.find(IconButton).length).toBe(0);
        expect(wrapper.find('i').prop('className')).toBe('icon icon-chevron-down');
    });
});
