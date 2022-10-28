// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Channel} from '@mattermost/types/channels';
import {UserProfile} from '@mattermost/types/users';
import {Post} from '@mattermost/types/posts';

import {TestHelper} from 'utils/test_helper';

import RhsThread from './rhs_thread';

jest.mock('components/advanced_text_editor/voice_message_attachment', () => () => <div/>);

describe('components/RhsThread', () => {
    const post: Post = TestHelper.getPostMock({
        channel_id: 'channel_id',
        create_at: 1502715365009,
        update_at: 1502715372443,
    });

    const channel: Channel = TestHelper.getChannelMock({
        display_name: '',
        name: '',
        header: '',
        purpose: '',
        creator_id: '',
        scheme_id: '',
        teammate_id: '',
        status: '',
    });

    const actions = {
        removePost: jest.fn(),
        selectPostCard: jest.fn(),
        getPostThread: jest.fn(),
    };

    const directTeammate: UserProfile = TestHelper.getUserMock();

    const baseProps = {
        posts: [post],
        selected: post,
        channel,
        currentUserId: 'user_id',
        previewCollapsed: 'false',
        previewEnabled: true,
        socketConnectionStatus: true,
        actions,
        directTeammate,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <RhsThread {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
