// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import IconButtonCommon from './icon_button_common';

describe('components/compass/menu/IconButtonCommon', () => {
    test('should match snapshot', () => {
        const Props = {
            iconGlyph: 'emoticon-happy-outline',
            size: 'small',
            label: 'icon button',
        };

        const wrapper = shallow(
            <IconButtonCommon
                {...Props}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('button').props().className).toBe('IconButton IconButton___small');
    });
});