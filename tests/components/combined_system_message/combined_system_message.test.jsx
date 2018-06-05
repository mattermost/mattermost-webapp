// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {General, Posts} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import CombinedSystemMessage from 'components/post_view/combined_system_message/combined_system_message.jsx';

describe('components/post_view/CombinedSystemMessage', () => {
    function emptyFunc() {} // eslint-disable-line no-empty-function
    const baseProps = {
        teammateNameDisplay: General.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME,
        currentUserId: 'current_user_id',
        currentUsername: 'current_username',
        allUserIds: ['added_user_id_1', 'user_id_1'],
        allUsernames: [],
        messageData: [{actorId: 'user_id_1', postType: Posts.POST_TYPES.ADD_TO_CHANNEL, userIds: ['added_user_id_1']}],
        actions: {
            getProfilesByIds: emptyFunc,
            getProfilesByUsernames: emptyFunc,
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <CombinedSystemMessage {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
