// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import NewChannelModal from 'components/create_comment/create_comment.jsx';

describe('components/NewChannelModal', () => {
    const userId = 'b4pfxi8sn78y8yq7phzxxfor7h';
    const teamId = 'e584uzbwwpny9kengqayx5ayzw';
    const channelId = 'g6139tbospd18cmxroesdk3kkc';
    const rootId = '';

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
              ctrlSend
              latestPostId='3424242234'
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
              ctrlSend
              latestPostId='3424242234'
              getSidebarBody={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, non-empty message and fileCount', () => {
        const wrapper = shallow(
          <CreateComment
              userId={userId}
              teamId={teamId}
              channelId={channelId}
              rootId={rootId}
              draft={{
                  message: 'Test message',
                  uploadsInProgress: [1],
                  fileInfos: [1,2,3]
              }}
              enableAddButton={false}
              ctrlSend
              latestPostId='3424242234'
              getSidebarBody={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
