// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelSelect from 'components/channel_select/channel_select';
import Constants from 'utils/constants';

describe('components/ChannelSelect', () => {
    const defaultProps = {
        channels: [
            {
                id: 'id1',
                display_name: 'Channel 1',
                name: 'channel1',
                type: Constants.OPEN_CHANNEL,
            },
            {
                id: 'id2',
                display_name: 'Channel 2',
                name: 'channel2',
                type: Constants.PRIVATE_CHANNEL,
            },
            {
                id: 'id3',
                display_name: 'Channel 3',
                name: 'channel3',
                type: Constants.DM_CHANNEL,
            },
        ],
        onChange: jest.fn(),
        value: 'testValue',
        selectOpen: false,
        selectPrivate: false,
        selectDm: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<ChannelSelect {...defaultProps}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
