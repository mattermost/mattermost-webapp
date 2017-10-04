// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ColorChooser from 'components/user_settings/color_chooser.jsx';

describe('components/user_settings/ColorChooser', () => {
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
