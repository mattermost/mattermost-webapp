// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import Menu from 'components/widgets/menu/menu';

import LeaveChannel from './leave_channel';

jest.mock('actions/global_actions', () => ({
    showLeavePrivateChannelModal: jest.fn(),
}));

describe('components/ChannelHeaderDropdown/MenuItem.LeaveChannel', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            type: Constants.OPEN_CHANNEL,
        },
        isDefault: false,
        actions: {
            leaveChannel: jest.fn(),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<LeaveChannel {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel is default channel', () => {
        const props = {
            ...baseProps,
            isDefault: true,
        };
        const wrapper = shallow(<LeaveChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel type is DM or GM', () => {
        const props = {
            ...baseProps,
            channel: {...baseProps.channel},
        };
        const makeWrapper = () => shallow(<LeaveChannel {...props}/>);

        props.channel.type = Constants.DM_CHANNEL;
        expect(makeWrapper()).toMatchSnapshot();

        props.channel.type = Constants.GM_CHANNEL;
        expect(makeWrapper()).toMatchSnapshot();
    });

    it('should runs leaveChannel function on click only if the channel is not private', () => {
        const props = {
            ...baseProps,
            channel: {...baseProps.channel},
            actions: {...baseProps.actions},
        };
        const {showLeavePrivateChannelModal} = require('actions/global_actions'); //eslint-disable-line global-require
        const wrapper = shallow(<LeaveChannel {...props}/>);

        wrapper.find(Menu.ItemAction).simulate('click', {
            preventDefault: jest.fn(),
        });
        expect(props.actions.leaveChannel).toHaveBeenCalledWith(props.channel.id);
        expect(showLeavePrivateChannelModal).not.toHaveBeenCalled();

        props.channel.type = Constants.PRIVATE_CHANNEL;
        props.actions.leaveChannel = jest.fn();
        wrapper.find(Menu.ItemAction).simulate('click', {
            preventDefault: jest.fn(),
        });
        expect(props.actions.leaveChannel).not.toHaveBeenCalled();
        expect(showLeavePrivateChannelModal).toHaveBeenCalledWith(props.channel);
    });
});
