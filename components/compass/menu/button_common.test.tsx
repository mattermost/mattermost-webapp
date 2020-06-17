// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ButtonCommon from './button_common';

describe('components/compass/menu/ButtonCommon', () => {
    test('should match snapshot', () => {
        const Props = {
            style: 'primary',
            size: 'small',
            label: 'Hello',
        };

        const wrapper = shallow(
            <ButtonCommon
                {...Props}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('button').props().className).toBe('Button Button___primary Button___small');
    });
});
