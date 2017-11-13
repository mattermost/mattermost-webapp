// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import CreateComment from 'components/create_comment/create_comment.jsx';

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
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
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
                enableAddButton={true}
                ctrlSend={true}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
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
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should clear draft uploads on mount', () => {
        const clearCommentDraftUploads = jest.fn();

        shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [{}],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={clearCommentDraftUploads}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        expect(clearCommentDraftUploads).toHaveBeenCalled();
    });

    test('should reset message history index on mount', () => {
        const onResetHistoryIndex = jest.fn();

        shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [{}],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={onResetHistoryIndex}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        expect(onResetHistoryIndex).toHaveBeenCalled();
    });

    test('should correctly change state when toggleEmojiPicker is called', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [{}],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        wrapper.instance().toggleEmojiPicker();

        expect(wrapper.state().showEmojiPicker).toBe(true);

        wrapper.instance().toggleEmojiPicker();

        expect(wrapper.state().showEmojiPicker).toBe(false);
    });

    test('should correctly change state when hideEmojiPicker is called', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [{}],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        wrapper.instance().hideEmojiPicker();

        expect(wrapper.state().showEmojiPicker).toBe(false);
    });

    test('should correctly update draft when handleEmojiClick is called', () => {
        const onUpdateCommentDraft = jest.fn();

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
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={onUpdateCommentDraft}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        wrapper.instance().handleEmojiClick({name: 'smile'});

        expect(onUpdateCommentDraft).toHaveBeenCalled();

        // Empty message case
        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({message: ':smile: '})
        );

        wrapper.setProps({draft: {message: 'test', uploadsInProgress: [], fileInfos: []}});

        wrapper.instance().handleEmojiClick({name: 'smile'});

        // Message with no space at the end
        expect(onUpdateCommentDraft.mock.calls[1][0]).toEqual(
            expect.objectContaining({message: 'test :smile: '})
        );

        wrapper.setProps({draft: {message: 'test ', uploadsInProgress: [], fileInfos: []}});

        wrapper.instance().handleEmojiClick({name: 'smile'});

        // Message with space at the end
        expect(onUpdateCommentDraft.mock.calls[2][0]).toEqual(
            expect.objectContaining({message: 'test :smile: '})
        );

        expect(wrapper.state().showEmojiPicker).toBe(false);
    });

    test('handlePostError should update state with the correct error', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [{}],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        wrapper.instance().handlePostError('test error 1');

        expect(wrapper.state().postError).toBe('test error 1');

        wrapper.instance().handlePostError('test error 2');

        expect(wrapper.state().postError).toBe('test error 2');
    });

    test('handleUploadError should update state with the correct error', () => {
        const onUpdateCommentDraft = jest.fn();

        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [1, 2, 3],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={onUpdateCommentDraft}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        const testError1 = 'test error 1';

        wrapper.instance().handleUploadError(testError1, 1);

        expect(onUpdateCommentDraft).toHaveBeenCalled();

        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({uploadsInProgress: [2, 3]})
        );

        expect(wrapper.state().serverError).toBe(testError1);

        // clientId = -1
        const testError2 = 'test error 2';

        wrapper.instance().handleUploadError(testError2, -1);

        // should not call onUpdateCommentDraft
        expect(onUpdateCommentDraft.mock.calls.length).toBe(1);

        expect(wrapper.state().serverError).toBe(testError2);
    });

    test('getFileCount should return the correct count', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [{}],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        expect(wrapper.instance().getFileCount()).toBe(4);

        wrapper.setProps({draft: {message: 'test', uploadsInProgress: [], fileInfos: []}});

        expect(wrapper.instance().getFileCount()).toBe(0);
    });

    test('should correctly change state when showPostDeletedModal is called', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [{}],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        wrapper.instance().showPostDeletedModal();

        expect(wrapper.state().showPostDeletedModal).toBe(true);
    });

    test('should correctly change state when hidePostDeletedModal is called', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [{}],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        wrapper.instance().hidePostDeletedModal();

        expect(wrapper.state().showPostDeletedModal).toBe(false);
    });

    test('handleUploadStart should update comment draft correctly', () => {
        const onUpdateCommentDraft = jest.fn();

        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [1, 2, 3],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={onUpdateCommentDraft}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        const focusTextbox = jest.fn();

        wrapper.instance().focusTextbox = focusTextbox;

        wrapper.instance().handleUploadStart([4, 5]);

        expect(onUpdateCommentDraft).toHaveBeenCalled();

        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({uploadsInProgress: [1, 2, 3, 4, 5]})
        );

        expect(focusTextbox).toHaveBeenCalled();
    });

    test('handleFileUploadComplete should update comment draft correctly', () => {
        const onUpdateCommentDraft = jest.fn();

        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [1, 2, 3],
                    fileInfos: [{test: 1}, {test: 2}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={onUpdateCommentDraft}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        wrapper.instance().handleFileUploadComplete([{test: 3}], [3]);

        expect(onUpdateCommentDraft).toHaveBeenCalled();

        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({uploadsInProgress: [1, 2], fileInfos: [{test: 1}, {test: 2}, {test: 3}]})
        );
    });

    test('calls showPostDeletedModal when createPostErrorId === api.post.create_post.root_id.app_error', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [1, 2, 3],
                    fileInfos: [{test: 1}, {test: 2}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
                createPostErrorId={null}
            />
        );

        const showPostDeletedModal = jest.fn();

        wrapper.instance().showPostDeletedModal = showPostDeletedModal;

        wrapper.setProps({createPostErrorId: 'api.post.create_post.root_id.app_error'});

        expect(showPostDeletedModal).toHaveBeenCalled();
    });

    test('calls focusTextbox when rootId changes', () => {
        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [1, 2, 3],
                    fileInfos: [{test: 1}, {test: 2}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
                createPostErrorId={null}
            />
        );

        const focusTextbox = jest.fn();

        wrapper.instance().focusTextbox = focusTextbox;

        wrapper.setProps({rootId: 'testid123'});

        expect(focusTextbox).toHaveBeenCalled();
    });

    test('handleChange should update comment draft correctly', () => {
        const onUpdateCommentDraft = jest.fn();

        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [1, 2, 3],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={onUpdateCommentDraft}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        const testMessage = 'new msg';
        const scrollToBottom = jest.fn();

        wrapper.instance().scrollToBottom = scrollToBottom;
        wrapper.instance().handleChange({target: {value: testMessage}});

        expect(onUpdateCommentDraft).toHaveBeenCalled();

        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({message: testMessage})
        );

        expect(scrollToBottom).toHaveBeenCalled();
    });

    test('should scroll to bottom when uploadsInProgress increase', () => {
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos: [{}, {}, {}]
        };

        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={draft}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        const scrollToBottom = jest.fn();

        wrapper.instance().scrollToBottom = scrollToBottom;

        wrapper.setProps({draft: {...draft, uploadsInProgress: [1, 2, 3, 4]}});

        expect(scrollToBottom).toHaveBeenCalled();
    });

    test('handleSubmit should call onSubmit prop', () => {
        const onSubmit = jest.fn();

        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [],
                    fileInfos: [{}, {}, {}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={jest.fn()}
                onSubmit={onSubmit}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        const preventDefault = jest.fn();

        wrapper.instance().handleSubmit({preventDefault});

        expect(onSubmit).toHaveBeenCalled();
        expect(preventDefault).toHaveBeenCalled();
    });

    test('removePreview should remove file info and upload in progress with corresponding id', () => {
        const onUpdateCommentDraft = jest.fn();

        const wrapper = shallow(
            <CreateComment
                channelId={channelId}
                rootId={rootId}
                draft={{
                    message: 'Test message',
                    uploadsInProgress: [4, 5, 6],
                    fileInfos: [{id: 1}, {id: 2}, {id: 3}]
                }}
                enableAddButton={true}
                ctrlSend={false}
                latestPostId={latestPostId}
                getSidebarBody={jest.fn()}
                clearCommentDraftUploads={jest.fn()}
                onUpdateCommentDraft={onUpdateCommentDraft}
                onSubmit={jest.fn()}
                onResetHistoryIndex={jest.fn()}
                onMoveHistoryIndexBack={jest.fn()}
                onMoveHistoryIndexForward={jest.fn()}
                onEditLatestPost={jest.fn()}
            />
        );

        wrapper.instance().removePreview(3);

        expect(onUpdateCommentDraft).toHaveBeenCalled();

        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({fileInfos: [{id: 1}, {id: 2}]})
        );

        wrapper.instance().removePreview(5);

        expect(onUpdateCommentDraft.mock.calls[1][0]).toEqual(
            expect.objectContaining({uploadsInProgress: [4, 6]})
        );
    });
});