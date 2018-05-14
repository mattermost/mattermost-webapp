// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Posts} from 'mattermost-redux/constants';

import LastUsers from 'components/post_view/combined_system_message/last_users.jsx';

describe('components/post_view/combined_system_message/LastUsers', () => {
    const baseProps = {
        actor: 'user_1',
        expandedLocale: {
            id: 'combined_system_message.added_to_channel.many_expanded',
            defaultMessage: '{users} and {lastUser} <b>added to the channel</b> by {actor}.',
        },
        postType: Posts.POST_TYPES.ADD_TO_CHANNEL,
        userDisplayNames: ['user_2', 'user_3', 'user_4 '],
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

    test('should match state on handleOnClick', () => {
        const wrapper = shallow(
            <LastUsers {...baseProps}/>
        );

        wrapper.setState({expand: false});
        wrapper.instance().handleOnClick({preventDefault: jest.fn()});
        expect(wrapper.state('expand')).toBe(true);
    });
});
