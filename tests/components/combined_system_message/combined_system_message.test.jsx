// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {General, Posts} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import CombinedSystemMessage from 'components/post_view/combined_system_message/combined_system_message.jsx';

describe('components/post_view/CombinedSystemMessage', () => {
    function emptyFunc() {} // eslint-disable-line no-empty-function
    const baseProps = {
        currentUserId: 'current_user_id',
        currentUsername: 'current_username',
        allUserIds: ['added_user_id_1', 'added_user_id_2', 'current_user_id', 'user_id_1'],
        allUsernames: [],
        messageData: [{
            actorId: 'user_id_1',
            postType: Posts.POST_TYPES.ADD_TO_CHANNEL,
            userIds: ['added_user_id_1'],
        }, {
            actorId: 'user_id_1',
            postType: Posts.POST_TYPES.ADD_TO_CHANNEL,
            userIds: ['current_user_id'],
        }, {
            actorId: 'current_user_id',
            postType: Posts.POST_TYPES.ADD_TO_CHANNEL,
            userIds: ['added_user_id_2'],
        }],
        showJoinLeave: true,
        teammateNameDisplay: General.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME,
        actions: {
            getProfilesByIds: emptyFunc,
            getProfilesByUsernames: emptyFunc,
        },
    };

    const userProfiles = [{
        id: 'added_user_id_1',
        username: 'AddedUser1',
    },
    {
        id: 'added_user_id_2',
        username: 'AddedUser2',
    },
    {
        id: 'current_user',
        username: 'CurrentUser',
    },
    {
        id: 'user_id_1',
        username: 'User1',
    }];

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <CombinedSystemMessage {...baseProps}/>
        );

        // Fake this state change since getProfilesByIds is called asynchronously
        wrapper.setState({userProfiles});

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when join leave messages are turned off', () => {
        const wrapper = shallowWithIntl(
            <CombinedSystemMessage
                {...baseProps}
                showJoinLeave={false}
            />
        );

        // Fake this state change since getProfilesByIds is called asynchronously
        wrapper.setState({userProfiles});

        expect(wrapper).toMatchSnapshot();
    });
});
