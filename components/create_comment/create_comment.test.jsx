// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';

import CreateComment from 'components/create_comment/create_comment.jsx';
import FileUpload from 'components/file_upload';
import FilePreview from 'components/file_preview/file_preview.jsx';

describe('components/CreateComment', () => {
    const channelId = 'g6139tbospd18cmxroesdk3kkc';
    const rootId = '';
    const latestPostId = '3498nv24823948v23m4nv34';

    const baseProps = {
        channelId,
        rootId,
        rootDeleted: false,
        channelMembersCount: 3,
        draft: {
            message: 'Test message',
            uploadsInProgress: [{}],
            fileInfos: [{}, {}, {}],
        },
        enableAddButton: true,
        ctrlSend: false,
        latestPostId,
        locale: 'en',
        getSidebarBody: jest.fn(),
        clearCommentDraftUploads: jest.fn(),
        onUpdateCommentDraft: jest.fn(),
        updateCommentDraftWithRootId: jest.fn(),
        onSubmit: jest.fn(),
        onResetHistoryIndex: jest.fn(),
        onMoveHistoryIndexBack: jest.fn(),
        onMoveHistoryIndexForward: jest.fn(),
        onEditLatestPost: jest.fn(),
        resetCreatePostRequest: jest.fn(),
        readOnlyChannel: false,
        enableEmojiPicker: true,
        enableGifPicker: true,
        enableConfirmNotificationsToChannel: true,
        maxPostSize: Constants.DEFAULT_CHARACTER_LIMIT,
        rhsExpanded: false,
        badConnection: false,
        getChannelTimezones: jest.fn(() => Promise.resolve([])),
        isTimezoneEnabled: false,
    };

    test('should match snapshot, empty comment', () => {
        const draft = {
            message: '',
            uploadsInProgress: [],
            fileInfos: [],
        };
        const enableAddButton = false;
        const ctrlSend = true;
        const props = {...baseProps, draft, enableAddButton, ctrlSend};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, comment with message', () => {
        const clearCommentDraftUploads = jest.fn();
        const onResetHistoryIndex = jest.fn();
        const draft = {
            message: 'Test message',
            uploadsInProgress: [],
            fileInfos: [],
        };
        const ctrlSend = true;
        const props = {...baseProps, ctrlSend, draft, clearCommentDraftUploads, onResetHistoryIndex};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        // should clear draft uploads on mount
        expect(clearCommentDraftUploads).toHaveBeenCalled();

        // should reset message history index on mount
        expect(onResetHistoryIndex).toHaveBeenCalled();

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, non-empty message and uploadsInProgress + fileInfos', () => {
        const draft = {
            message: 'Test message',
            uploadsInProgress: [{}],
            fileInfos: [{}, {}, {}],
        };

        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );

        wrapper.setState({draft});
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly change state when toggleEmojiPicker is called', () => {
        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );

        wrapper.instance().toggleEmojiPicker();
        expect(wrapper.state().showEmojiPicker).toBe(true);

        wrapper.instance().toggleEmojiPicker();
        expect(wrapper.state().showEmojiPicker).toBe(false);
    });

    test('should correctly change state when hideEmojiPicker is called', () => {
        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );

        wrapper.instance().hideEmojiPicker();
        expect(wrapper.state().showEmojiPicker).toBe(false);
    });

    test('should correctly update draft when handleEmojiClick is called', () => {
        const onUpdateCommentDraft = jest.fn();
        const draft = {
            message: '',
            uploadsInProgress: [],
            fileInfos: [],
        };
        const enableAddButton = false;
        const props = {...baseProps, draft, onUpdateCommentDraft, enableAddButton};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        wrapper.instance().handleEmojiClick({name: 'smile'});
        expect(onUpdateCommentDraft).toHaveBeenCalled();

        // Empty message case
        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({message: ':smile: '})
        );
        expect(wrapper.state().draft.message).toBe(':smile: ');

        wrapper.setState({draft: {message: 'test', uploadsInProgress: [], fileInfos: []}});
        wrapper.instance().handleEmojiClick({name: 'smile'});

        // Message with no space at the end
        expect(onUpdateCommentDraft.mock.calls[1][0]).toEqual(
            expect.objectContaining({message: 'test :smile: '})
        );
        expect(wrapper.state().draft.message).toBe('test :smile: ');

        wrapper.setState({draft: {message: 'test ', uploadsInProgress: [], fileInfos: []}});
        wrapper.instance().handleEmojiClick({name: 'smile'});

        // Message with space at the end
        expect(onUpdateCommentDraft.mock.calls[2][0]).toEqual(
            expect.objectContaining({message: 'test :smile: '})
        );
        expect(wrapper.state().draft.message).toBe('test :smile: ');

        expect(wrapper.state().showEmojiPicker).toBe(false);
    });

    test('handlePostError should update state with the correct error', () => {
        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );

        wrapper.instance().handlePostError('test error 1');
        expect(wrapper.state().postError).toBe('test error 1');

        wrapper.instance().handlePostError('test error 2');
        expect(wrapper.state().postError).toBe('test error 2');
    });

    test('handleUploadError should update state with the correct error', () => {
        const updateCommentDraftWithRootId = jest.fn();
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos: [{}, {}, {}],
        };
        const props = {...baseProps, draft, updateCommentDraftWithRootId};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        const instance = wrapper.instance();

        const testError1 = 'test error 1';
        wrapper.setState({draft});
        instance.draftsForPost[props.rootId] = draft;
        instance.handleUploadError(testError1, 1, props.rootId);

        expect(updateCommentDraftWithRootId).toHaveBeenCalled();
        expect(updateCommentDraftWithRootId.mock.calls[0][0]).toEqual(props.rootId);
        expect(updateCommentDraftWithRootId.mock.calls[0][1]).toEqual(
            expect.objectContaining({uploadsInProgress: [2, 3]})
        );
        expect(wrapper.state().serverError).toBe(testError1);
        expect(wrapper.state().draft.uploadsInProgress).toEqual([2, 3]);

        // clientId = -1
        const testError2 = 'test error 2';
        instance.handleUploadError(testError2, -1, props.rootId);

        // should not call onUpdateCommentDraft
        expect(updateCommentDraftWithRootId.mock.calls.length).toBe(1);
        expect(wrapper.state().serverError).toBe(testError2);
    });

    test('getFileCount should return the correct count', () => {
        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );

        expect(wrapper.instance().getFileCount()).toBe(3);

        wrapper.setState({draft: {message: 'test', uploadsInProgress: [{}], fileInfos: [{}, {}, {}]}});
        expect(wrapper.instance().getFileCount()).toBe(4);

        wrapper.setState({draft: {message: 'test', uploadsInProgress: [], fileInfos: []}});
        expect(wrapper.instance().getFileCount()).toBe(0);
    });

    test('should correctly change state when showPostDeletedModal is called', () => {
        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );

        wrapper.instance().showPostDeletedModal();
        expect(wrapper.state().showPostDeletedModal).toBe(true);
    });

    test('should correctly change state when hidePostDeletedModal is called', () => {
        const resetCreatePostRequest = jest.fn();
        const props = {...baseProps, resetCreatePostRequest};
        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        wrapper.instance().hidePostDeletedModal();
        expect(wrapper.state().showPostDeletedModal).toBe(false);
        expect(resetCreatePostRequest).toHaveBeenCalledTimes(1);
    });

    test('handleUploadStart should update comment draft correctly', () => {
        const onUpdateCommentDraft = jest.fn();
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos: [{}, {}, {}],
        };
        const props = {...baseProps, onUpdateCommentDraft, draft};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        const focusTextbox = jest.fn();
        wrapper.setState({draft});
        wrapper.instance().focusTextbox = focusTextbox;
        wrapper.instance().handleUploadStart([4, 5]);

        expect(onUpdateCommentDraft).toHaveBeenCalled();
        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({uploadsInProgress: [1, 2, 3, 4, 5]})
        );

        expect(wrapper.state().draft.uploadsInProgress === [1, 2, 3, 4, 5]);
        expect(focusTextbox).toHaveBeenCalled();
    });

    test('handleFileUploadComplete should update comment draft correctly', () => {
        const updateCommentDraftWithRootId = jest.fn();
        const fileInfos = [{id: '1', name: 'aaa', create_at: 100}, {id: '2', name: 'bbb', create_at: 200}];
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos,
        };
        const props = {...baseProps, updateCommentDraftWithRootId, draft};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        const instance = wrapper.instance();
        wrapper.setState({draft});
        instance.draftsForPost[props.rootId] = draft;

        const uploadCompleteFileInfo = [{id: '3', name: 'ccc', create_at: 300}];
        const expectedNewFileInfos = fileInfos.concat(uploadCompleteFileInfo);
        instance.handleFileUploadComplete(uploadCompleteFileInfo, [3], null, props.rootId);
        expect(updateCommentDraftWithRootId).toHaveBeenCalled();
        expect(updateCommentDraftWithRootId.mock.calls[0][0]).toEqual(props.rootId);
        expect(updateCommentDraftWithRootId.mock.calls[0][1]).toEqual(
            expect.objectContaining({uploadsInProgress: [1, 2], fileInfos: expectedNewFileInfos})
        );

        expect(wrapper.state().draft.uploadsInProgress).toEqual([1, 2]);
        expect(wrapper.state().draft.fileInfos).toEqual(expectedNewFileInfos);
    });

    it('check for uploadsProgressPercent state on handleUploadProgress callback', () => {
        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );

        wrapper.find(FileUpload).prop('onUploadProgress')({clientId: 'clientId', name: 'name', percent: 10, type: 'type'});
        expect(wrapper.find(FilePreview).prop('uploadsProgressPercent')).toEqual({clientId: {percent: 10, name: 'name', type: 'type'}});

        expect(wrapper.state('uploadsProgressPercent')).toEqual({clientId: {percent: 10, name: 'name', type: 'type'}});
    });

    test('calls showPostDeletedModal when createPostErrorId === api.post.create_post.root_id.app_error', () => {
        const onUpdateCommentDraft = jest.fn();
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos: [{id: '1', name: 'aaa', create_at: 100}, {id: '2', name: 'bbb', create_at: 200}],
        };
        const props = {...baseProps, onUpdateCommentDraft, draft};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        const showPostDeletedModal = jest.fn();
        wrapper.instance().showPostDeletedModal = showPostDeletedModal;
        wrapper.setProps({createPostErrorId: 'api.post.create_post.root_id.app_error'});
        expect(showPostDeletedModal).toHaveBeenCalled();
    });

    test('calls focusTextbox when rootId changes', () => {
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos: [{id: '1', name: 'aaa', create_at: 100}, {id: '2', name: 'bbb', create_at: 200}],
        };
        const props = {...baseProps, draft};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        const focusTextbox = jest.fn();
        wrapper.instance().focusTextbox = focusTextbox;
        wrapper.setProps({rootId: 'testid123'});
        expect(focusTextbox).toHaveBeenCalled();
    });

    test('handleChange should update comment draft correctly', () => {
        const onUpdateCommentDraft = jest.fn();
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos: [{}, {}, {}],
        };
        const props = {...baseProps, onUpdateCommentDraft, draft};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        const testMessage = 'new msg';
        const scrollToBottom = jest.fn();
        wrapper.instance().scrollToBottom = scrollToBottom;
        wrapper.instance().handleChange({target: {value: testMessage}});

        expect(onUpdateCommentDraft).toHaveBeenCalled();
        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({message: testMessage})
        );
        expect(wrapper.state().draft.message).toBe(testMessage);
        expect(scrollToBottom).toHaveBeenCalled();
    });

    test('should scroll to bottom when uploadsInProgress increase', () => {
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos: [{}, {}, {}],
        };
        const props = {...baseProps, draft};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        const scrollToBottom = jest.fn();
        wrapper.instance().scrollToBottom = scrollToBottom;
        wrapper.setState({draft: {...draft, uploadsInProgress: [1, 2, 3, 4]}});
        expect(scrollToBottom).toHaveBeenCalled();
    });

    test('handleSubmit should call onSubmit prop', () => {
        const onSubmit = jest.fn();
        const draft = {
            message: 'Test message',
            uploadsInProgress: [],
            fileInfos: [{}, {}, {}],
        };
        const props = {...baseProps, draft, onSubmit};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        const preventDefault = jest.fn();
        wrapper.instance().handleSubmit({preventDefault});
        expect(onSubmit).toHaveBeenCalled();
        expect(preventDefault).toHaveBeenCalled();
    });

    describe('handleSubmit', () => {
        let onSubmit;
        let preventDefault;

        beforeEach(() => {
            onSubmit = jest.fn();
            preventDefault = jest.fn();
        });

        ['channel', 'all'].forEach((mention) => {
            describe(`should not show Confirm Modal for @${mention} mentions`, () => {
                it('when channel member count too low', () => {
                    const props = {
                        ...baseProps,
                        draft: {
                            message: `Test message @${mention}`,
                            uploadsInProgress: [],
                            fileInfos: [{}, {}, {}],
                        },
                        onSubmit,
                        channelMembersCount: 1,
                        enableConfirmNotificationsToChannel: true,
                    };

                    const wrapper = shallow(
                        <CreateComment {...props}/>
                    );

                    wrapper.instance().handleSubmit({preventDefault});
                    expect(onSubmit).toHaveBeenCalled();
                    expect(preventDefault).toHaveBeenCalled();
                    expect(wrapper.state('showConfirmModal')).toBe(false);
                });

                it('when feature disabled', () => {
                    const props = {
                        ...baseProps,
                        draft: {
                            message: `Test message @${mention}`,
                            uploadsInProgress: [],
                            fileInfos: [{}, {}, {}],
                        },
                        onSubmit,
                        channelMembersCount: 8,
                        enableConfirmNotificationsToChannel: false,
                    };

                    const wrapper = shallow(
                        <CreateComment {...props}/>
                    );

                    wrapper.instance().handleSubmit({preventDefault});
                    expect(onSubmit).toHaveBeenCalled();
                    expect(preventDefault).toHaveBeenCalled();
                    expect(wrapper.state('showConfirmModal')).toBe(false);
                });

                it('when no mention', () => {
                    const props = {
                        ...baseProps,
                        draft: {
                            message: `Test message ${mention}`,
                            uploadsInProgress: [],
                            fileInfos: [{}, {}, {}],
                        },
                        onSubmit,
                        channelMembersCount: 8,
                        enableConfirmNotificationsToChannel: true,
                    };

                    const wrapper = shallow(
                        <CreateComment {...props}/>
                    );

                    wrapper.instance().handleSubmit({preventDefault});
                    expect(onSubmit).toHaveBeenCalled();
                    expect(preventDefault).toHaveBeenCalled();
                    expect(wrapper.state('showConfirmModal')).toBe(false);
                });
            });

            it(`should show Confirm Modal for @${mention} mentions when needed`, () => {
                const props = {
                    ...baseProps,
                    draft: {
                        message: `Test message @${mention}`,
                        uploadsInProgress: [],
                        fileInfos: [{}, {}, {}],
                    },
                    onSubmit,
                    channelMembersCount: 8,
                    enableConfirmNotificationsToChannel: true,
                };

                const wrapper = shallow(
                    <CreateComment {...props}/>
                );

                wrapper.instance().handleSubmit({preventDefault});
                expect(onSubmit).not.toHaveBeenCalled();
                expect(preventDefault).toHaveBeenCalled();
                expect(wrapper.state('showConfirmModal')).toBe(true);
            });

            it(`should show Confirm Modal for @${mention} mentions when needed and timezone notification`, () => {
                const props = {
                    ...baseProps,
                    draft: {
                        message: `Test message @${mention}`,
                        uploadsInProgress: [],
                        fileInfos: [{}, {}, {}],
                    },
                    onSubmit,
                    isTimezoneEnabled: true,
                    channelMembersCount: 8,
                    enableConfirmNotificationsToChannel: true,
                };

                const wrapper = shallow(
                    <CreateComment {...props}/>
                );

                wrapper.instance().handleSubmit({preventDefault});
                wrapper.setState({channelMembersCount: 4});

                expect(onSubmit).not.toHaveBeenCalled();
                expect(preventDefault).toHaveBeenCalled();
                expect(wrapper.state('channelMembersCount')).toBe(4);
                expect(baseProps.getChannelTimezones).toHaveBeenCalledTimes(1);
                expect(wrapper.state('showConfirmModal')).toBe(true);
            });

            it(`should show Confirm Modal for @${mention} mentions when needed and no timezone notification`, () => {
                const props = {
                    ...baseProps,
                    draft: {
                        message: `Test message @${mention}`,
                        uploadsInProgress: [],
                        fileInfos: [{}, {}, {}],
                    },
                    onSubmit,
                    isTimezoneEnabled: true,
                    channelMembersCount: 8,
                    enableConfirmNotificationsToChannel: true,
                };

                const wrapper = shallow(
                    <CreateComment {...props}/>
                );

                wrapper.instance().handleSubmit({preventDefault});
                wrapper.setState({channelMembersCount: 0});

                expect(onSubmit).not.toHaveBeenCalled();
                expect(preventDefault).toHaveBeenCalled();
                expect(wrapper.state('channelMembersCount')).toBe(0);
                expect(baseProps.getChannelTimezones).toHaveBeenCalledTimes(1);
                expect(wrapper.state('showConfirmModal')).toBe(true);
            });
        });
    });

    test('removePreview should remove file info and upload in progress with corresponding id', () => {
        const onUpdateCommentDraft = jest.fn();
        const draft = {
            message: 'Test message',
            uploadsInProgress: [4, 5, 6],
            fileInfos: [{id: 1}, {id: 2}, {id: 3}],
        };
        const props = {...baseProps, draft, onUpdateCommentDraft};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        wrapper.setState({draft});

        wrapper.instance().removePreview(3);
        expect(onUpdateCommentDraft).toHaveBeenCalled();
        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({fileInfos: [{id: 1}, {id: 2}]})
        );
        expect(wrapper.state().draft.fileInfos).toEqual([{id: 1}, {id: 2}]);

        wrapper.instance().removePreview(5);
        expect(onUpdateCommentDraft.mock.calls[1][0]).toEqual(
            expect.objectContaining({uploadsInProgress: [4, 6]})
        );
        expect(wrapper.state().draft.uploadsInProgress).toEqual([4, 6]);
    });

    test('should match draft state on componentWillReceiveProps with change in messageInHistory', () => {
        const draft = {
            message: 'Test message',
            uploadsInProgress: [],
            fileInfos: [{}, {}, {}],
        };

        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );
        expect(wrapper.state('draft')).toEqual(draft);

        const newDraft = {...draft, message: 'Test message edited'};
        wrapper.setProps({draft: newDraft, messageInHistory: 'Test message edited'});
        expect(wrapper.state('draft')).toEqual(newDraft);
    });

    test('should match draft state on componentWillReceiveProps with new rootId', () => {
        const draft = {
            message: 'Test message',
            uploadsInProgress: [4, 5, 6],
            fileInfos: [{id: 1}, {id: 2}, {id: 3}],
        };

        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );
        wrapper.setState({draft});
        expect(wrapper.state('draft')).toEqual(draft);

        wrapper.setProps({rootId: 'new_root_id'});
        expect(wrapper.state('draft')).toEqual({...draft, uploadsInProgress: [], fileInfos: [{}, {}, {}]});
    });

    test('should match snapshot read only channel', () => {
        const props = {...baseProps, readOnlyChannel: true};
        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, emoji picker disabled', () => {
        const props = {...baseProps, enableEmojiPicker: false};
        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('check for handleFileUploadChange callback for focus', () => {
        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );
        const instance = wrapper.instance();
        instance.focusTextbox = jest.fn();

        instance.handleFileUploadChange();
        expect(instance.focusTextbox).toHaveBeenCalledTimes(1);
    });

    test('should call functions on handleKeyDown', () => {
        const onMoveHistoryIndexBack = jest.fn();
        const onMoveHistoryIndexForward = jest.fn();
        const onEditLatestPost = jest.fn().
            mockImplementationOnce(() => ({data: true})).
            mockImplementationOnce(() => ({data: false}));
        const wrapper = shallow(
            <CreateComment
                {...baseProps}
                ctrlSend={true}
                onMoveHistoryIndexBack={onMoveHistoryIndexBack}
                onMoveHistoryIndexForward={onMoveHistoryIndexForward}
                onEditLatestPost={onEditLatestPost}
            />
        );
        const instance = wrapper.instance();
        instance.commentMsgKeyPress = jest.fn();
        instance.focusTextbox = jest.fn();
        const blur = jest.fn();
        const focus = jest.fn();
        instance.refs = {textbox: {getWrappedInstance: () => ({blur, focus})}};

        const commentMsgKey = {
            preventDefault: jest.fn(),
            ctrlKey: true,
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
        };
        instance.handleKeyDown(commentMsgKey);
        expect(instance.commentMsgKeyPress).toHaveBeenCalledTimes(1);

        const upKey = {
            preventDefault: jest.fn(),
            ctrlKey: true,
            key: Constants.KeyCodes.UP[0],
            keyCode: Constants.KeyCodes.UP[1],
        };
        instance.handleKeyDown(upKey);
        expect(upKey.preventDefault).toHaveBeenCalledTimes(1);
        expect(onMoveHistoryIndexBack).toHaveBeenCalledTimes(1);

        const downKey = {
            preventDefault: jest.fn(),
            ctrlKey: true,
            key: Constants.KeyCodes.DOWN[0],
            keyCode: Constants.KeyCodes.DOWN[1],
        };
        instance.handleKeyDown(downKey);
        expect(downKey.preventDefault).toHaveBeenCalledTimes(1);
        expect(onMoveHistoryIndexForward).toHaveBeenCalledTimes(1);

        wrapper.setState({draft: {message: '', fileInfos: [], uploadsInProgress: []}});
        const upKeyForEdit = {
            preventDefault: jest.fn(),
            ctrlKey: false,
            key: Constants.KeyCodes.UP[0],
            keyCode: Constants.KeyCodes.UP[1],
        };
        instance.handleKeyDown(upKeyForEdit);
        expect(upKeyForEdit.preventDefault).toHaveBeenCalledTimes(1);
        expect(onEditLatestPost).toHaveBeenCalledTimes(1);
        expect(blur).toHaveBeenCalledTimes(1);

        instance.handleKeyDown(upKeyForEdit);
        expect(upKeyForEdit.preventDefault).toHaveBeenCalledTimes(2);
        expect(onEditLatestPost).toHaveBeenCalledTimes(2);
        expect(instance.focusTextbox).toHaveBeenCalledTimes(1);
        expect(instance.focusTextbox).toHaveBeenCalledWith(true);
    });

    test('should the RHS thread scroll to bottom one time after mount when props.draft.message is not empty', () => {
        const draft = {
            message: '',
            uploadsInProgress: [],
            fileInfos: [],
        };

        const wrapper = shallow(
            <CreateComment {...baseProps}/>
        );

        wrapper.instance().scrollToBottom = jest.fn();
        expect(wrapper.instance().scrollToBottom).toBeCalledTimes(0);
        expect(wrapper.instance().doInitialScrollToBottom).toEqual(true);

        // should scroll to bottom on first component update
        wrapper.setState({draft: {...draft, message: 'new message'}});
        expect(wrapper.instance().scrollToBottom).toBeCalledTimes(1);
        expect(wrapper.instance().doInitialScrollToBottom).toEqual(false);

        // but not after the first update
        wrapper.setState({draft: {...draft, message: 'another message'}});
        expect(wrapper.instance().scrollToBottom).toBeCalledTimes(1);
        expect(wrapper.instance().doInitialScrollToBottom).toEqual(false);
    });

    test('should the RHS thread scroll to bottom when state.draft.uploadsInProgress increases but not when it decreases', () => {
        const draft = {
            message: '',
            uploadsInProgress: [],
            fileInfos: [],
        };

        const wrapper = shallow(
            <CreateComment
                {...baseProps}
                draft={draft}
            />
        );

        wrapper.instance().scrollToBottom = jest.fn();
        expect(wrapper.instance().scrollToBottom).toBeCalledTimes(0);

        wrapper.setState({draft: {...draft, uploadsInProgress: [1]}});
        expect(wrapper.instance().scrollToBottom).toBeCalledTimes(1);

        wrapper.setState({draft: {...draft, uploadsInProgress: [1, 2]}});
        expect(wrapper.instance().scrollToBottom).toBeCalledTimes(2);

        wrapper.setState({draft: {...draft, uploadsInProgress: [2]}});
        expect(wrapper.instance().scrollToBottom).toBeCalledTimes(2);
    });
});
