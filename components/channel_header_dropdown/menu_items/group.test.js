// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Group from './group';

describe('components/ChannelHeaderDropdown/MenuItem.Group', () => {
    it('should match snapshot', () => {
        const wrapper = shallow(<Group>{'children'}</Group>);
        expect(wrapper).toMatchSnapshot();
    });
});
