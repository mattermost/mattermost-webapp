// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import AddMembers from './add_members';

describe('components/ChannelHeaderDropdown/MenuItem.AddMembers', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            team_id: 'team_id',
            type: Constants.OPEN_CHANNEL,
        },
        isDefault: false,
        isArchived: false,
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<AddMembers {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel is default channel', () => {
        const props = {
            ...baseProps,
            isDefault: true,
        };
        const wrapper = shallow(<AddMembers {...props}/>);
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden if the channel is archived', () => {
        const props = {
            ...baseProps,
            isArchived: true,
        };
        const wrapper = shallow(<AddMembers {...props}/>);
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden if the channel type is DM or GM', () => {
        const props = {
            ...baseProps,
            channel: {...baseProps.channel},
        };
        const makeWrapper = () => shallow(<AddMembers {...props}/>);

        props.channel.type = Constants.DM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();

        props.channel.type = Constants.GM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();
    });
});
