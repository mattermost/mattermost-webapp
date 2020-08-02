// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelSelectorModal from 'components/channel_selector_modal/channel_selector_modal.jsx';

describe('components/ChannelSelectorModal', () => {
    const defaultProps = {
        excludeNames: [],
        currentSchemeId: 'xxx',
        alreadySelected: ['id1'],
        searchTerm: '',
        channels: [
            {
                id: 'id1',
                delete_at: 0,
                scheme_id: '',
                display_name: 'Channel 1',
                team_display_name: 'Team 1',
            },
            {
                id: 'id2',
                delete_at: 123,
                scheme_id: '',
                display_name: 'Channel 2',
                team_display_name: 'Team 2',
            },
            {
                id: 'id3',
                delete_at: 0,
                scheme_id: 'test',
                display_name: 'Channel 3',
                team_display_name: 'Team 3',
            },
            {
                id: 'id4',
                delete_at: 0,
                scheme_id: '',
                display_name: 'Channel 4',
                team_display_name: 'Team 4',
            },
        ],
        onModalDismissed: jest.fn(),
        onChannelsSelected: jest.fn(),
        groupID: '',
        actions: {
            loadChannels: jest.fn(() => Promise.resolve({data: []})),
            setModalSearchTerm: jest.fn(() => Promise.resolve()),
            searchChannels: jest.fn(() => Promise.resolve({})),
            searchAllChannels: jest.fn(() => Promise.resolve({})),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<ChannelSelectorModal {...defaultProps}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
