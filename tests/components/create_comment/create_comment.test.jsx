// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CreateComment from 'components/create_comment/create_comment.jsx';
import Constants from 'utils/constants.jsx';

jest.mock('stores/post_store.jsx', () => ({
    clearCommentDraftUploads: jest.fn(),
}));

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
        getSidebarBody: jest.fn(),
        clearCommentDraftUploads: jest.fn(),
        onUpdateCommentDraft: jest.fn(),
        onSubmit: jest.fn(),
        onResetHistoryIndex: jest.fn(),
        onMoveHistoryIndexBack: jest.fn(),
        onMoveHistoryIndexForward: jest.fn(),
        onEditLatestPost: jest.fn(),
        resetCreatePostRequest: jest.fn(),
        readOnlyChannel: false,
        enableEmojiPicker: true,
        enableConfirmNotificationsToChannel: true,
        maxPostSize: Constants.DEFAULT_CHARACTER_LIMIT,
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
        const onUpdateCommentDraft = jest.fn();
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos: [{}, {}, {}],
        };
        const props = {...baseProps, draft, onUpdateCommentDraft};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        const testError1 = 'test error 1';
        wrapper.setState({draft});
        wrapper.instance().handleUploadError(testError1, 1);

        expect(onUpdateCommentDraft).toHaveBeenCalled();
        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({uploadsInProgress: [2, 3]})
        );
        expect(wrapper.state().serverError).toBe(testError1);
        expect(wrapper.state().draft.uploadsInProgress).toEqual([2, 3]);

        // clientId = -1
        const testError2 = 'test error 2';
        wrapper.instance().handleUploadError(testError2, -1);

        // should not call onUpdateCommentDraft
        expect(onUpdateCommentDraft.mock.calls.length).toBe(1);
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
        const onUpdateCommentDraft = jest.fn();
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos: [{test: 1}, {test: 2}],
        };
        const props = {...baseProps, onUpdateCommentDraft, draft};

        const wrapper = shallow(
            <CreateComment {...props}/>
        );

        wrapper.setState({draft});

        wrapper.instance().handleFileUploadComplete([{test: 3}], [3]);
        expect(onUpdateCommentDraft).toHaveBeenCalled();
        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({uploadsInProgress: [1, 2], fileInfos: [{test: 1}, {test: 2}, {test: 3}]})
        );

        expect(wrapper.state().draft.uploadsInProgress).toEqual([1, 2]);
        expect(wrapper.state().draft.fileInfos).toEqual([{test: 1}, {test: 2}, {test: 3}]);
    });

    test('calls showPostDeletedModal when createPostErrorId === api.post.create_post.root_id.app_error', () => {
        const onUpdateCommentDraft = jest.fn();
        const draft = {
            message: 'Test message',
            uploadsInProgress: [1, 2, 3],
            fileInfos: [{test: 1}, {test: 2}],
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
            fileInfos: [{test: 1}, {test: 2}],
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
});
