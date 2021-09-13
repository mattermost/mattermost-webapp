// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AddChannelDropdown from '../add_channel_dropdown';
import {AddChannelButtonTreatments} from 'mattermost-redux/constants/config';

import ChannelNavigator, {Props} from './channel_navigator';

let props: Props;

describe('Components/ChannelNavigator', () => {
    beforeEach(() => {
        props = {
            addChannelButton: AddChannelButtonTreatments.NONE,
            canGoForward: true,
            canGoBack: true,
            canJoinPublicChannel: true,
            showMoreChannelsModal: jest.fn(),
            invitePeopleModal: jest.fn(),
            showNewChannelModal: jest.fn(),
            showCreateCategoryModal: jest.fn(),
            handleOpenDirectMessagesModal: jest.fn(),
            unreadFilterEnabled: true,
            canCreateChannel: true,
            showUnreadsCategory: true,
            townSquareDisplayName: 'idk',
            offTopicDisplayName: 'idk',
            showTutorialTip: true,
            globalHeaderEnabled: true,
            isQuickSwitcherOpen: false,
            actions: {
                openModal: jest.fn(),
                closeModal: jest.fn(),
                goBack: jest.fn(),
                goForward: jest.fn(),
            },
        };
    });

    it('should show AddChannelDropdown when there is no A/B treatment', () => {
        const wrapper = shallow(<ChannelNavigator {...props}/>);
        expect(wrapper.find(AddChannelDropdown).length).toBe(1);
    });

    it('should show AddChannelDropdown when A/B treatment is unknown', () => {
        delete props.addChannelButton;
        const wrapper = shallow(<ChannelNavigator {...props}/>);
        expect(wrapper.find(AddChannelDropdown).length).toBe(1);
    });

    it('should not show AddChannelDropdown when there is an active A/B treatment', () => {
        props.addChannelButton = AddChannelButtonTreatments.BY_TEAM_NAME;
        const wrapper = shallow(<ChannelNavigator {...props}/>);
        expect(wrapper.find(AddChannelDropdown).length).toBe(0);
    });
});
