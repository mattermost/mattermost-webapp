// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LastUsers from 'components/post_view/combined_system_message/last_users.jsx';

describe('components/post_view/combined_system_message/LastUsers', () => {
    const baseProps = {
        firstUserEl: 'user_2 and ',
        lastUsersEl: '2 others',
        allUsersEl: 'user_2, user_3 and user_4 ',
        what: 'added to the channel by',
        actor: 'user_1',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <LastUsers {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, expanded', () => {
        const wrapper = shallow(
            <LastUsers {...baseProps}/>
        );

        wrapper.setState({expand: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state on click', () => {
        const wrapper = shallow(
            <LastUsers {...baseProps}/>
        );

        wrapper.setState({expand: false});
        wrapper.instance().handleClick({preventDefault: jest.fn()});
        expect(wrapper.state('expand')).toBe(true);
    });
});
