// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants, NotificationLevels} from 'utils/constants';

import ToggleMuteChannel from './toggle_mute_channel';

describe('components/ChannelHeaderDropdown/MenuItem.ToggleMuteChannel', () => {
    const baseProps = {
        user: {
            id: 'user_id',
        },
        channel: {
            id: 'channel_id',
            type: Constants.OPEN_CHANNEL,
        },
        isMuted: false,
        actions: {
            updateChannelNotifyProps: jest.fn(),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<ToggleMuteChannel {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should unmute channel on click the channel was muted', () => {
        const props = {
            ...baseProps,
            isMuted: true,
            actions: {
                updateChannelNotifyProps: jest.fn(),
            },
        };
        const wrapper = shallow(<ToggleMuteChannel {...props}/>);

        wrapper.find('button').simulate('click');

        expect(props.actions.updateChannelNotifyProps).toBeCalledWith(
            props.user.id,
            props.channel.id,
            {mark_unread: NotificationLevels.ALL}
        );
    });

    it('should mute channel on click the channel was unmuted', () => {
        const props = {
            ...baseProps,
            isMuted: false,
            actions: {
                updateChannelNotifyProps: jest.fn(),
            },
        };
        const wrapper = shallow(<ToggleMuteChannel {...props}/>);

        wrapper.find('button').simulate('click');

        expect(props.actions.updateChannelNotifyProps).toBeCalledWith(
            props.user.id,
            props.channel.id,
            {mark_unread: NotificationLevels.MENTION}
        );
    });

    it('should be hidden if the channel type is DM', () => {
        const props = {
            ...baseProps,
            channel: {
                ...baseProps.channel,
                type: Constants.DM_CHANNEL,
            },
        };
        const wrapper = shallow(<ToggleMuteChannel {...props}/>);
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });
});
