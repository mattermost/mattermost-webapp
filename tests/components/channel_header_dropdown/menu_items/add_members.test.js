// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';
import {AddMembers} from 'components/channel_header_dropdown/menu_items';

describe('components/ChannelHeaderDropdown/MenuItem.AddMembers', () => {
    it('should be hidden if the channel is default channel', () => {
        const wrapper = shallow(
            <AddMembers
                channel={{
                    id: 'channel_id',
                    team_id: 'team_id',
                    type: Constants.OPEN_CHANNEL,
                }}
                isDefault={true}
            />
        );
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden when if the channel is DM channel', () => {
        const wrapper = shallow(
            <AddMembers
                channel={{
                    id: 'channel_id',
                    team_id: 'team_id',
                    type: Constants.DM_CHANNEL,
                }}
                isDefault={false}
            />
        );
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should match snapshot for public channel', () => {
        const wrapper = shallow(
            <AddMembers
                channel={{
                    id: 'channel_id',
                    team_id: 'team_id',
                    type: Constants.OPEN_CHANNEL,
                }}
                isDefault={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for private channel', () => {
        const wrapper = shallow(
            <AddMembers
                channel={{
                    id: 'channel_id',
                    team_id: 'team_id',
                    type: Constants.PRIVATE_CHANNEL,
                }}
                isDefault={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for group message', () => {
        const wrapper = shallow(
            <AddMembers
                channel={{
                    id: 'channel_id',
                    team_id: 'team_id',
                    type: Constants.GM_CHANNEL,
                }}
                isDefault={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
