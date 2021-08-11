// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';

import React from 'react';

import {Post} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';

import PostMessagePreview, {Props} from './post_message_preview';

describe('PostMessagePreview', () => {
    const previewPost = {
        id: 'post_id',
        message: 'post message',
    } as Post;

    const user = {
        id: 'user_1',
        username: 'username1',
    } as UserProfile;

    const baseProps: Props = {
        metadata: {
            channel_display_name: 'channel name',
            team_name: 'team1',
            post_id: 'post_id',
        },
        previewPost,
        user,
    };

    test('should render correctly', () => {
        const wrapper = shallow(<PostMessagePreview {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should render without preview', () => {
        const wrapper = shallow(
            <PostMessagePreview
                {...baseProps}
                previewPost={undefined}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
