// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import IconButton from './icon_button';

describe('components/compass/IconButton', () => {
    test('should match snapshot', () => {
        const Props = {
            iconGlyph: 'emoticon-happy-outline',
            size: 'small',
            label: 'icon button',
        };

        const wrapper = shallow(
            <IconButton
                {...Props}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('button').props().className).toBe('IconButton IconButton___small');
    });
});