// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LoggedIn from 'components/logged_in/logged_in.jsx';

jest.mock('actions/websocket_actions.jsx', () => ({
    initialize: jest.fn(),
}));

describe('components/logged_in/LoggedIn', () => {
    const children = <span>{'Test'}</span>;
    const baseProps = {
        currentUser: {},
        enableTimezone: false,
        actions: {
            autoUpdateTimezone: jest.fn(),
        },
        location: {
            pathname: '/',
        },
    };

    it('should render loading state without user', () => {
        const props = {
            ...baseProps,
            currentUser: null,
        };

        const wrapper = shallow(<LoggedIn {...props}>{children}</LoggedIn>);

        expect(wrapper).toMatchInlineSnapshot(`
<LoadingScreen
  position="relative"
  style={Object {}}
/>
`
        );
    });
});
