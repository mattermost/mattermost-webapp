// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Permissions} from 'mattermost-redux/constants';

import {SetChannelPurpose} from 'components/channel_header_dropdown/menu_items';
import {Constants} from 'utils/constants';

describe('components/ChannelHeaderDropdown/MenuItem.SetChannelPurpose', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            team_id: 'team_id',
            type: Constants.OPEN_CHANNEL,
        },
        isReadonly: false,
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<SetChannelPurpose {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel is readonly', () => {
        const props = {
            ...baseProps,
            isReadonly: true,
        };
        const wrapper = shallow(<SetChannelPurpose {...props}/>);

        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden if the channel type is DM or GM', () => {
        const props = baseProps;
        const makeWrapper = () => shallow(<SetChannelPurpose {...props}/>);

        props.channel.type = Constants.DM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();

        props.channel.type = Constants.GM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();
    });

    it('should requires right permission level for channel type to manage purpose', () => {
        const props = baseProps;
        const makeWrapper = () => shallow(<SetChannelPurpose {...props}/>);

        props.channel.type = Constants.OPEN_CHANNEL;
        expect(makeWrapper().prop('permissions')[0]).toBe(Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES);

        props.channel.type = Constants.PRIVATE_CHANNEL;
        expect(makeWrapper().prop('permissions')[0]).toBe(Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES);
    });
});
