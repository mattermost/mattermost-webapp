// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import * as redux from 'react-redux';

import GlobalHeader from 'components/global/global_header';

describe('components/global/global_header', () => {
    test('should be disabled when global header is disabled', () => {
        const spy = jest.spyOn(redux, 'useSelector');
        spy.mockReturnValue(false);

        const wrapper = shallow(
            <GlobalHeader/>,
        );

        expect(wrapper.type()).toEqual(null);
    });

    test('should be enabled when global header is enabled', () => {
        const spy = jest.spyOn(redux, 'useSelector');
        spy.mockReturnValue(true);

        const wrapper = shallow(
            <GlobalHeader/>,
        );

        expect(wrapper.type()).not.toEqual(null);
    });
});
