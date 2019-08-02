// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Posts} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import RhsComment from 'components/rhs_comment/rhs_comment.jsx';

jest.mock('utils/post_utils.jsx', () => ({
    isEdited: jest.fn().mockReturnValue(true),
    isSystemMessage: jest.fn().mockReturnValue(false),
    fromAutoResponder: jest.fn().mockReturnValue(false),
}));

describe('components/RhsComment', () => {
    let post;
    let defaultProps;

    beforeEach(() => {
        post = {
            channel_id: 'channel_id',
            create_at: 1502715365009,
            delete_at: 0,
            edit_at: 1502715372443,
            id: 'id',
            is_pinned: false,
            message: 'post message',
            original_id: '',
            parent_id: '',
            pending_post_id: '',
            props: {},
            root_id: '',
            type: '',
            update_at: 1502715372443,
            user_id: 'user_id',
        };

        defaultProps = {
            post,
            teamId: 'team_id',
            currentUserId: 'user_id',
            compactDisplay: true,
            author: 'Author',
            reactions: {},
            isFlagged: true,
            isBusy: false,
            removePost: jest.fn(),
            previewCollapsed: '',
            previewEnabled: false,
            isEmbedVisible: false,
            enableEmojiPicker: true,
            enablePostUsernameOverride: false,
            isReadOnly: false,
            pluginPostTypes: {},
            channelIsArchived: false,
            isConsecutivePost: false,
            handleCardClick: jest.fn(),
        };
    });

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <RhsComment {...defaultProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot hovered', () => {
        const wrapper = shallowWithIntl(
            <RhsComment {...defaultProps}/>
        );

        wrapper.setState({hover: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot hovered on deleted post', () => {
        const props = {
            ...defaultProps,
            post: {
                ...defaultProps.post,
                state: Posts.POST_DELETED,
            },
        };
        const wrapper = shallowWithIntl(
            <RhsComment {...props}/>
        );
        wrapper.setState({hover: true});

        expect(wrapper).toMatchSnapshot();
    });
});
