// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';

import Menu from 'components/widgets/menu/menu';

import {TestHelper} from 'utils/test_helper';

import LeaveChannel from './leave_channel';

jest.mock('actions/global_actions', () => ({
    showLeavePrivateChannelModal: jest.fn(),
}));

describe('components/ChannelHeaderDropdown/MenuItem.LeaveChannel', () => {
    const baseProps = {
        channel: TestHelper.getChannelMock({
            id: 'channel_id',
            type: 'O',
        }),
        isDefault: false,
        actions: {
            leaveChannel: jest.fn(),
        },
    };

    it('should match snapshot', () => {
        const wrapper: ShallowWrapper<any, any, LeaveChannel> = shallow(<LeaveChannel {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel is default channel', () => {
        const props = {
            ...baseProps,
            isDefault: true,
        };
        const wrapper: ShallowWrapper<any, any, LeaveChannel> = shallow(<LeaveChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel type is DM or GM', () => {
        const props = {
            ...baseProps,
            channel: {...baseProps.channel},
        };
        const makeWrapper = () => shallow(<LeaveChannel {...props}/>);

        props.channel.type = 'D';
        expect(makeWrapper()).toMatchSnapshot();

        props.channel.type = 'G';
        expect(makeWrapper()).toMatchSnapshot();
    });

    it('should runs leaveChannel function on click only if the channel is not private', () => {
        const props = {
            ...baseProps,
            channel: {...baseProps.channel},
            actions: {...baseProps.actions},
        };
        const {showLeavePrivateChannelModal} = require('actions/global_actions'); //eslint-disable-line global-require
        const wrapper: ShallowWrapper<any, any, LeaveChannel> = shallow(<LeaveChannel {...props}/>);

        wrapper.find(Menu.ItemAction).simulate('click', {
            preventDefault: jest.fn(),
        });
        expect(props.actions.leaveChannel).toHaveBeenCalledWith(props.channel.id);
        expect(showLeavePrivateChannelModal).not.toHaveBeenCalled();

        props.channel.type = 'P';
        props.actions.leaveChannel = jest.fn();
        wrapper.find(Menu.ItemAction).simulate('click', {
            preventDefault: jest.fn(),
        });
        expect(props.actions.leaveChannel).not.toHaveBeenCalled();
        expect(showLeavePrivateChannelModal).toHaveBeenCalledWith(props.channel);
    });
});
