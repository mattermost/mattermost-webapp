// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Permissions} from 'mattermost-redux/constants';

import {ManageMembers} from 'components/channel_header_dropdown/menu_items';
import {Constants} from 'utils/constants';

describe('components/ChannelHeaderDropdown/MenuItem.ViewMembers', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            team_id: 'team_id',
            type: Constants.OPEN_CHANNEL,
        },
        isDefault: false,
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<ManageMembers {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel is default channel', () => {
        const props = {
            ...baseProps,
            isDefault: true,
        };
        const wrapper = shallow(<ManageMembers {...props}/>);

        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should right permission level for channel type', () => {
        const props = baseProps;
        const makeWrapper = () => shallow(<ManageMembers {...props}/>);

        props.channel.type = Constants.OPEN_CHANNEL;
        expect(makeWrapper().prop('permissions')[0]).toBe(Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS);

        props.channel.type = Constants.PRIVATE_CHANNEL;
        expect(makeWrapper().prop('permissions')[0]).toBe(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS);
    });
});
