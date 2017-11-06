// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';
import * as Emoji from 'utils/emoji.jsx';

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

    const userId = 'b4pfxi8sn78y8yq7phzxxfor7h';
    const teamId = 'e584uzbwwpny9kengqayx5ayzw';
    const channelId = 'g6139tbospd18cmxroesdk3kkc';
    const rootId = '';
    const emojis = Emoji.EmojiIndicesByAlias;

    test('should match snapshot, empty comment', () => {
        const wrapper = shallow(
            <CreateComment
              userId={userId}
              teamId={teamId}
              channelId={channelId}
              rootId={rootId}
              draft={{
                  message: '',
                  uploadsInProgress: [],
                  fileInfos: []
              }}
              enableAddButton={false}
              emojis={emojis}
              ctrlSend
              latestPostId={rootId}
              getSidebarBody={jest.fn()}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, comment with message', () => {
        const wrapper = shallow(
          <CreateComment
              userId={userId}
              teamId={teamId}
              channelId={channelId}
              rootId={rootId}
              draft={{
                  message: 'Test message',
                  uploadsInProgress: [],
                  fileInfos: []
              }}
              enableAddButton={false}
              emojis={emojis}
              ctrlSend
              latestPostId={rootId}
              getSidebarBody={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, non-empty message and uploadsInProgress + fileInfos', () => {
        const wrapper = shallow(
          <CreateComment
              userId={userId}
              teamId={teamId}
              channelId={channelId}
              rootId={rootId}
              draft={{
                  message: 'Test message',
                  uploadsInProgress: [{}],
                  fileInfos: [{},{},{}]
              }}
              enableAddButton={false}
              emojis={emojis}
              ctrlSend
              latestPostId={rootId}
              getSidebarBody={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});