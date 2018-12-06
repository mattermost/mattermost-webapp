// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import ViewChannelInfo from './view_channel_info';

describe('components/ChannelHeaderDropdown/MenuItem.ViewChannelInfo', () => {
    const baseProps = {
        channel: {
            type: Constants.OPEN_CHANNEL,
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<ViewChannelInfo {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel type is DM or GM', () => {
        const props = {
            channel: {...baseProps.channel},
        };
        const makeWrapper = () => shallow(<ViewChannelInfo {...props}/>);

        props.channel.type = Constants.DM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();

        props.channel.type = Constants.GM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();
    });
});
