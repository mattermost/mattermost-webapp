// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Posts} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import LastUsers from 'components/post_view/combined_system_message/last_users.jsx';

describe('components/post_view/combined_system_message/LastUsers', () => {
    const formatOptions = {
        atMentions: true,
        mentionKeys: [{key: '@username2'}, {key: '@username3'}, {key: '@username4'}],
        mentionHighlight: false,
    };
    const baseProps = {
        actor: 'user_1',
        expandedLocale: {
            id: 'combined_system_message.added_to_channel.many_expanded',
            defaultMessage: '{users} and {lastUser} **added to the channel** by {actor}.',
        },
        formatOptions,
        postType: Posts.POST_TYPES.ADD_TO_CHANNEL,
        usernames: ['@username2', '@username3', '@username4 '],
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <LastUsers {...baseProps}/>
        ).dive();

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, expanded', () => {
        const wrapper = shallowWithIntl(
            <LastUsers {...baseProps}/>
        ).dive();

        wrapper.setState({expand: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state on handleOnClick', () => {
        const wrapper = shallowWithIntl(
            <LastUsers {...baseProps}/>
        ).dive();

        wrapper.setState({expand: false});
        wrapper.instance().handleOnClick({preventDefault: jest.fn()});
        expect(wrapper.state('expand')).toBe(true);
    });
});
