// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import IconCommon from './icon_common';

describe('components/compass/menu/IconCommon', () => {
    test('should match snapshot', () => {
        const Props = {
            glyph: 'emoticon-happy-outline',
            size: 'xsmall',
            label: 'icon',
        };

        const wrapper = shallow(
            <IconCommon
                {...Props}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('i').props().className).toBe('Icon Icon___xsmall icon-emoticon-happy-outline');
    });
});
