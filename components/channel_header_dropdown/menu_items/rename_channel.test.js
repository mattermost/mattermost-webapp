// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Permissions} from 'mattermost-redux/constants';

import {Constants} from 'utils/constants';

import RenameChannel from './rename_channel';

describe('components/ChannelHeaderDropdown/MenuItem.RenameChannel', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            team_id: 'team_id',
            type: Constants.OPEN_CHANNEL,
        },
        isArchived: false,
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<RenameChannel {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel is archived', () => {
        const props = {
            ...baseProps,
            isArchived: true,
        };
        const wrapper = shallow(<RenameChannel {...props}/>);

        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden if the channel is DM or GM', () => {
        const props = {
            ...baseProps,
            channel: {...baseProps.channel},
        };
        const makeWrapper = () => shallow(<RenameChannel {...props}/>);

        props.channel.type = Constants.DM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();

        props.channel.type = Constants.GM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();
    });

    it('should requires right permission level for channel type', () => {
        const props = {
            ...baseProps,
            channel: {...baseProps.channel},
        };
        const makeWrapper = () => shallow(<RenameChannel {...props}/>);

        props.channel.type = Constants.OPEN_CHANNEL;
        expect(makeWrapper().prop('permissions')[0]).toBe(Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES);

        props.channel.type = Constants.PRIVATE_CHANNEL;
        expect(makeWrapper().prop('permissions')[0]).toBe(Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES);
    });
});
