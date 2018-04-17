// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import CombinedSystemMessage from 'components/post_view/combined_system_message/combined_system_message.jsx';

describe('components/post_view/CombinedSystemMessage', () => {
    const baseProps = {
        currentUserId: 'current_user_id',
        userActivityProps: {system_add_to_channel: {user_id_1: ['current_user_id', 'added_user_id_2', 'added_user_id_3'], current_user_id: ['added_user_id_4']}},
        actions: {
            getMissingProfilesByIds: () => {},  // eslint-disable-line
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <CombinedSystemMessage {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
