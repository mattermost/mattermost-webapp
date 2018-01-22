// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ColorSetting from 'components/admin_console/color_setting.jsx';

describe('components/ColorSetting', () => {
    test('should match snapshot, all', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <ColorSetting
                id='id'
                label='label'
                helpText='helptext'
                value='#fff'
                onChange={emptyFunction}
                disabled={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, no help text', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <ColorSetting
                id='id'
                label='label'
                value='#fff'
                onChange={emptyFunction}
                disabled={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, disabled', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <ColorSetting
                id='id'
                label='label'
                value='#fff'
                onChange={emptyFunction}
                disabled={true}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
