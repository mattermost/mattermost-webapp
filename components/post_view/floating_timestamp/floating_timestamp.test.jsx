// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FloatingTimestamp from './floating_timestamp.jsx';

describe('components/post_view/FloatingTimestamp', () => {
    const baseProps = {
        isScrolling: true,
        isMobile: true,
        createAt: 1234,
        toastPresent: true,
        isRhsPost: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<FloatingTimestamp {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.hasClass('toastAdjustment')).toBe(true);
    });
});
