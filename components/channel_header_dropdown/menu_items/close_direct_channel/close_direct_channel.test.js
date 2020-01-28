// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import Menu from 'components/widgets/menu/menu';

import CloseDirectChannel from './close_direct_channel';

describe('components/ChannelHeaderDropdown/MenuItem.CloseDirectChannel', () => {
    const baseProps = {
        currentUser: {
            id: 'user_id',
        },
        channel: {
            id: 'channel_id',
            type: Constants.DM_CHANNEL,
            teammate_id: 'teammate-id',
        },
        redirectChannel: 'test-default-channel',
        currentTeam: {
            id: 'team_id',
            name: 'test-team',
            display_name: 'Test team display name',
            description: 'Test team description',
            type: 'team-type',
        },
        actions: {
            savePreferences: jest.fn(() => Promise.resolve()),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<CloseDirectChannel {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('shoud be hidden if the channel is not a DM', () => {
        const props = {
            ...baseProps,
            channel: {
                id: 'channel_id',
                type: Constants.GM_CHANNEL,
                teammate_id: 'teammate-id',
            },
        };

        const wrapper = shallow(<CloseDirectChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should run savePreferences function on click', () => {
        const wrapper = shallow(<CloseDirectChannel {...baseProps}/>);
        wrapper.find(Menu.ItemAction).simulate('click', {
            preventDefault: jest.fn(),
        });
        expect(baseProps.actions.savePreferences).toBeCalledWith(baseProps.currentUser.id, [{user_id: baseProps.currentUser.id, category: Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: baseProps.channel.teammate_id, value: 'false'}]);
    });
});