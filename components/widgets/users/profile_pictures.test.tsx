// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Avatar from './avatars';

describe('components/widgets/users/Avatar', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(
            <Avatar
                url='test-url'
                username='test-username'
                size='xl'
            />,
        );
        
    });

    test('should match the snapshot only with url', () => {
        const wrapper = shallow(
            <Avatar url='test-url'/>,
        );
    });
});
