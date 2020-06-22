// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Label from './label';

describe('components/compass/Label', () => {
    test('should match snapshot', () => {
        const Props = {
            children: 'text',
            size: 'small',
        };

        const wrapper = shallow(
            <Label
                {...Props}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('span').props().className).toBe('Label Label___small');
    });
});