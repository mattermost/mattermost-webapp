// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppBinding} from 'mattermost-redux/types/apps';
import {Post} from 'mattermost-redux/types/posts';
import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import SelectBinding from './select_binding';

describe('components/post_view/embedded_bindings/select_binding', () => {
    const post = {
        id: 'post_id',
        channel_id: 'channel_id',
    } as Post;

    const binding = {} as AppBinding;

    const baseProps = {
        post,
        userId: 'user_id',
        binding,
        actions: {
            doAppCall: jest.fn(async () => {
                return {data: {type: 'ok'}};
            }),
            getChannel: jest.fn(async (id: string) => {
                return {data: {id, team_id: 'team_id'}};
            }),
        },
    };

    test('should start with nothing selected', () => {
        const wrapper = shallowWithIntl(<SelectBinding {...baseProps}/>);

        expect(wrapper.state()).toMatchObject({});
    });
});
