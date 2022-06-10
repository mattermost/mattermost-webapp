// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AdminBadge from './admin_badge';

describe('components/widgets/badges/AdminBadge', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(<AdminBadge className={'test'}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
