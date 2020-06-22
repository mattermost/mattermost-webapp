// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Button from './button';

describe('components/compass/Button', () => {
    test('should match snapshot', () => {
        const Props = {
            style: 'primary',
            size: 'small',
            label: 'Hello',
        };

        const wrapper = shallow(
            <Button
                {...Props}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('button').props().className).toBe('Button Button___primary Button___small');
    });
});
