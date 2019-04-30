// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import NewMessageSeparator from './new_message_separator.jsx';

describe('components/post_view/new_message_separator', () => {
    test('should render new_message_separator', () => {
        const wrapper = shallowWithIntl(
            <NewMessageSeparator separatorId='1234'/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
