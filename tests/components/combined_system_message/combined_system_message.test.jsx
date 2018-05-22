// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Posts} from 'mattermost-redux/constants';

import CombinedSystemMessage from 'components/post_view/combined_system_message/combined_system_message.jsx';

describe('components/post_view/CombinedSystemMessage', () => {
    const baseProps = {
        currentUserId: 'current_user_id',
        allUserIds: ['added_user_id_1', 'user_id_1'],
        messageData: [{actorId: 'user_id_1', postType: Posts.POST_TYPES.ADD_TO_CHANNEL, userIds: ['added_user_id_1']}],
        actions: {
            getMissingProfilesByIds: () => {},  // eslint-disable-line
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <CombinedSystemMessage {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
