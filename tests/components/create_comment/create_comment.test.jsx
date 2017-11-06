// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import CreateComment from 'components/create_comment/create_comment.jsx';

jest.mock('stores/message_history_store.jsx', () => ({
    resetHistoryIndex: jest.fn()
}));

jest.mock('stores/post_store.jsx', () => ({
    clearCommentDraftUploads: jest.fn()
}));

describe('components/CreateComment', () => {
    beforeEach(() => {
        window.mm_config = {};
        window.mm_config.EnableEmojiPicker = 'true';
    });

    const channelId = 'g6139tbospd18cmxroesdk3kkc';
    const rootId = '';
    const latestPostId = '3498nv24823948v23m4nv34';

    test('should match snapshot, empty comment', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: '',
                    uploadsInProgress: [],
                    fileInfos: []
                }}
                enableAddButton={false}
                ctrlSend={true}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, comment with message', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [],
                    fileInfos: []
                }}
                enableAddButton={false}
                ctrlSend={true}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, non-empty message and uploadsInProgress + fileInfos', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [{}],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={false}
                ctrlSend={true}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});