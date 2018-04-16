// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SystemUsers from 'components/admin_console/system_users/system_users.jsx';

describe('components/admin_console/system_users', () => {
    const defaultProps = {
        teams: [],
        siteName: 'Site name',
        mfaEnabled: false,
        enableUserAccessTokens: false,
        experimentalEnableAuthenticationTransfer: false,
        actions: {
            getTeams: jest.fn().mockImplementation(() => Promise.resolve()),
            getTeamStats: jest.fn().mockImplementation(() => Promise.resolve()),
            getUser: jest.fn().mockImplementation(() => Promise.resolve()),
            getUserAccessToken: jest.fn().mockImplementation(() => Promise.resolve()),
        },
    };

    test('should match default snapshot', () => {
        const props = defaultProps;
        const wrapper = shallow(<SystemUsers {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
