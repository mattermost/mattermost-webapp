// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {Preferences} from 'mattermost-redux/constants';

import CustomThemeChooser from 'components/user_settings/display/user_settings_theme/custom_theme_chooser.jsx';

describe('components/user_settings/display/CustomThemeChooser', () => {
    const baseProps = {
        theme: Preferences.THEMES.default,
        updateTheme: jest.fn(),
    };

    it('should match, init', () => {
        const wrapper = shallow(
            <CustomThemeChooser {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should create a custom theme when the code theme changes', () => {
        const wrapper = shallow(
            <CustomThemeChooser {...baseProps}/>,
        );

        const event = {
            target: {
                value: 'monokai',
            },
        };

        wrapper.instance().onCodeThemeChange(event);
        expect(baseProps.updateTheme).toHaveBeenCalledTimes(1);
        expect(baseProps.updateTheme).toHaveBeenCalledWith({
            ...baseProps.theme,
            type: 'custom',
            codeTheme: 'monokai',
        });
    });
});
