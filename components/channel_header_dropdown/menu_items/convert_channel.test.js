// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import ConvertChannel from './convert_channel';

describe('components/ChannelHeaderDropdown/MenuItem.ConvertChannel', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            team_id: 'team_id',
            display_name: 'Test Channel',
            type: Constants.OPEN_CHANNEL,
        },
        isDefault: false,
        isArchived: false,
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<ConvertChannel {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel is default channel', () => {
        const props = {
            ...baseProps,
            isDefault: true,
        };
        const wrapper = shallow(<ConvertChannel {...props}/>);
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden if the channel is archived', () => {
        const props = {
            ...baseProps,
            isArchived: true,
        };
        const wrapper = shallow(<ConvertChannel {...props}/>);
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden if the channel is not public channel', () => {
        const props = {
            ...baseProps,
            channel: {...baseProps.channel},
        };
        const makeWrapper = () => shallow(<ConvertChannel {...props}/>);

        props.channel.type = Constants.PRIVATE_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();

        props.channel.type = Constants.DM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();

        props.channel.type = Constants.GM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();
    });
});
