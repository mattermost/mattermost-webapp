// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Permissions} from 'mattermost-redux/constants';

import {Constants} from 'utils/constants';

import DeleteChannel from './delete_channel';

describe('components/ChannelHeaderDropdown/MenuItem.DeleteChannel', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            team_id: 'team_id',
            type: Constants.OPEN_CHANNEL,
        },
        isDefault: false,
        isArchived: false,
        penultimateViewedChannelName: '',
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<DeleteChannel {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel is default', () => {
        const props = {
            ...baseProps,
            isDefault: true,
        };
        const wrapper = shallow(<DeleteChannel {...props}/>);
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden if the channel is archived', () => {
        const props = {
            ...baseProps,
            isArchived: true,
        };
        const wrapper = shallow(<DeleteChannel {...props}/>);
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden if the channel is DM or GM', () => {
        const props = {
            ...baseProps,
            channel: {...baseProps.channel},
        };
        const makeWrapper = () => shallow(<DeleteChannel {...props}/>);

        props.channel.type = Constants.DM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();

        props.channel.type = Constants.GM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();
    });

    it('should requires right permission level by channel type', () => {
        const props = {
            ...baseProps,
            channel: {...baseProps.channel},
        };
        const makeWrapper = () => shallow(<DeleteChannel {...props}/>);

        props.channel.type = Constants.OPEN_CHANNEL;
        expect(makeWrapper().prop('permissions')[0]).toBe(Permissions.DELETE_PUBLIC_CHANNEL);

        props.channel.type = Constants.PRIVATE_CHANNEL;
        expect(makeWrapper().prop('permissions')[0]).toBe(Permissions.DELETE_PRIVATE_CHANNEL);
    });
});
