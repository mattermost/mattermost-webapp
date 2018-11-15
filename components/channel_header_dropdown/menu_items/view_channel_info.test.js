// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ViewChannelInfo from './view_channel_info';

describe('components/ChannelHeaderDropdown/MenuItem.ViewChannelInfo', () => {
    it('should match snapshot', () => {
        const wrapper = shallow(
            <ViewChannelInfo channel={{}}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
