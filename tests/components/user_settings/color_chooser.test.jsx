// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ColorChooser from 'components/user_settings/display/user_settings_theme/color_chooser.jsx';

describe('components/user_settings/display/ColorChooser', () => {
    it('should match, init', () => {
        const wrapper = shallow(
            <ColorChooser
                color='#ffeec0'
                label='Choose color'
                id='choose-color'
            />
        );

        expect(wrapper).toMatchSnapshot();
    });
});
