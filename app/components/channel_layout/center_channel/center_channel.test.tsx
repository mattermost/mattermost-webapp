// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CenterChannel from './center_channel';

describe('components/channel_layout/CenterChannel', () => {
    const props = {
        location: {
            pathname: '/some',
        },
        lastChannelPath: '',
        lhsOpen: true,
        rhsOpen: true,
        rhsMenuOpen: true,
        match: {
            url: '/url',
        },
    };
    test('should call update returnTo on props change', () => {
        const wrapper = shallow(<CenterChannel {...props}/>);

        expect(wrapper.state('returnTo')).toBe('');

        wrapper.setProps({
            location: {
                pathname: '/pl/path',
            },
        });
        expect(wrapper.state('returnTo')).toBe('/some');
        wrapper.setProps({
            location: {
                pathname: '/pl/path1',
            },
        });
        expect(wrapper.state('returnTo')).toBe('/pl/path');
    });
});
