// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import UserAccessTokens from 'components/admin_console/user_access_tokens/user_access_tokens';

describe('components/admin_console/UserAccessTokens', () => {
    global.window.mm_license = {};
    global.window.mm_config = {};

    beforeEach(() => {
        global.window.mm_license.IsLicensed = 'false';
    });

    afterEach(() => {
        global.window.mm_license = {};
        global.window.mm_config = {};
    });

    const baseProps = {};

    test('should match snapshot with base props', () => {
        const wrapper = shallow(
            <UserAccessTokens {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
