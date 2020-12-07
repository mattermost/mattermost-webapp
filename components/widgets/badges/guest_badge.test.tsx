// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GuestBadge from './guest_badge';

describe('components/widgets/badges/GuestBadge', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(<GuestBadge className={'test'}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
