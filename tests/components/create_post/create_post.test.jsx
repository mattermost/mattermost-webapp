// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';

import {Posts} from 'mattermost-redux/constants';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import Constants, {StoragePrefixes} from 'utils/constants.jsx';
import CreatePost from 'components/create_post/create_post.jsx';
import * as Utils from 'utils/utils.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';

jest.mock('actions/global_actions.jsx', () => ({
    emitLocalUserTypingEvent: jest.fn(),
    emitUserPostedEvent: jest.fn(),
    showChannelHeaderUpdateModal: jest.fn(),
    showChannelPurposeUpdateModal: jest.fn(),
    showChannelNameUpdateModal: jest.fn(),
    toggleShortcutsModal: jest.fn()
}));

jest.mock('react-dom', () => ({
    findDOMNode: () => ({
        blur: jest.fn()
    })
}));

const KeyCodes = Constants.KeyCodes;
const currentTeamIdProp = 'r7rws4y7ppgszym3pdd5kaibfa';
const currentUserIdProp = 'zaktnt8bpbgu8mb6ez9k64r7sa';
const showTutorialTipProp = '999';
const fullWidthTextBoxProp = true;
const recentPostIdInChannelProp = 'a';

const currentChannelProp = {
    id: 'owsyt8n43jfxjpzh9np93mx1wa',
    type: 'O'
};
const currentChannelMembersCountProp = 9;
const draftProp = {
    message: '',
    uploadsInProgress: [],
    fileInfos: []
};

const ctrlSendProp = false;

const currentUsersLatestPostProp = {id: 'b', root_id: 'a', channel_id: currentChannelProp.id};

const commentCountForPostProp = 10;

function emptyFunction() {} //eslint-disable-line no-empty-function
const actionsProp = {
    addMessageIntoHistory: emptyFunction,
    moveHistoryIndexBack: emptyFunction,
    moveHistoryIndexForward: emptyFunction,
    createPost: emptyFunction,
    addReaction: emptyFunction,
    removeReaction: emptyFunction,
    clearDraftUploads: emptyFunction,
    setDraft: emptyFunction,
    setEditingPost: emptyFunction
};

function createPost({
      currentChannel = currentChannelProp,
      currentTeamId = currentTeamIdProp,
      currentUserId = currentUserIdProp,
      showTutorialTip = showTutorialTipProp,
      currentChannelMembersCount = currentChannelMembersCountProp,
      fullWidthTextBox = fullWidthTextBoxProp,
      draft = draftProp,
      recentPostIdInChannel = recentPostIdInChannelProp,
      actions = actionsProp,
      ctrlSend = ctrlSendProp,
      currentUsersLatestPost = currentUsersLatestPostProp,
      commentCountForPost = commentCountForPostProp
    } = {}) {
    return (
        <CreatePost
            currentChannel={currentChannel}
            currentTeamId={currentTeamId}
            currentUserId={currentUserId}
            showTutorialTip={showTutorialTip}
            fullWidthTextBox={fullWidthTextBox}
            currentChannelMembersCount={currentChannelMembersCount}
            draft={draft}
            recentPostIdInChannel={recentPostIdInChannel}
            ctrlSend={ctrlSend}
            currentUsersLatestPost={currentUsersLatestPost}
            commentCountForPost={commentCountForPost}
            actions={actions}
        />
    );
}

describe('components/create_post', () => {
    window.mm_config = {
        EnableEmojiPicker: 'true',
        EnableFileAttachments: 'true',
        EnableConfirmNotificationsToChannel: 'true'
    };

    it('should match snapshot, init', () => {
        const wrapper = shallow(createPost({}));

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for center textbox', () => {
        const wrapper = shallow(createPost({fullWidthTextBox: false}));

        expect(wrapper.find('#create_post').hasClass('center')).toBe(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('should call clearDraftUploads on mount', () => {
        const clearDraftUploads = jest.fn();
        const actions = {
            ...actionsProp,
            clearDraftUploads
        };

        shallow(createPost({actions}));

        expect(clearDraftUploads).toHaveBeenCalled();
    });

    it('Check for state change on channelId change', () => {
        const wrapper = shallow(createPost());
        const draft = {
            ...draftProp,
            message: 'test'
        };

        expect(wrapper.state('message')).toBe('');

        wrapper.setProps({draft});
        expect(wrapper.state('message')).toBe('');

        wrapper.setProps({
            currentChannel: {
                ...currentChannelProp,
                id: 'owsyt8n43jfxjpzh9np93mx1wb'
            }
        });
        expect(wrapper.state('message')).toBe('test');
    });

    it('click toggleEmojiPicker', () => {
        const wrapper = shallow(createPost());
        wrapper.find('.icon.icon--emoji').simulate('click');
        expect(wrapper.state('showEmojiPicker')).toBe(true);
        wrapper.find('.icon.icon--emoji').simulate('click');
        wrapper.find('EmojiPickerOverlay').prop('onHide')();
        expect(wrapper.state('showEmojiPicker')).toBe(false);
    });

    it('Check for emoji click message states', () => {
        const wrapper = shallow(createPost());

        wrapper.find('.icon.icon--emoji').simulate('click');
        expect(wrapper.state('showEmojiPicker')).toBe(true);

        wrapper.instance().handleEmojiClick({name: 'smile'});
        expect(wrapper.state('message')).toBe(':smile: ');

        wrapper.setState({
            message: 'test'
        });

        wrapper.instance().handleEmojiClick({name: 'smile'});
        expect(wrapper.state('message')).toBe('test :smile: ');

        wrapper.setState({
            message: 'test '
        });

        wrapper.instance().handleEmojiClick({name: 'smile'});
        expect(wrapper.state('message')).toBe('test :smile: ');
    });

    it('onChange textbox should call setDraft and change message state', () => {
        const setDraft = jest.fn();
        const draft = {
            ...draftProp,
            message: 'change'
        };

        const wrapper = shallow(
            createPost({
                actions: {
                    ...actionsProp,
                    setDraft
                }
            })
        );

        const postTextbox = wrapper.find('#post_textbox');
        postTextbox.simulate('change', {target: {value: 'change'}});
        expect(setDraft).toHaveBeenCalledWith(StoragePrefixes.DRAFT + currentChannelProp.id, draft);
    });

    it('onKeyPress textbox should call emitLocalUserTypingEvent', () => {
        const wrapper = shallow(createPost());

        const postTextbox = wrapper.find('#post_textbox');
        postTextbox.simulate('KeyPress', {which: KeyCodes.ENTER, preventDefault: jest.fn()});
        expect(GlobalActions.emitLocalUserTypingEvent).toHaveBeenCalledWith(currentChannelProp.id, '');
    });

    it('onSubmit test for @all', () => {
        const createPostAction = jest.fn(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }
        );

        const wrapper = shallow(
            createPost({
                actions: {
                    ...actionsProp,
                    createPost: createPostAction
                }
            })
        );

        wrapper.setState({
            message: 'test @all'
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(true);
        wrapper.instance().hideNotifyAllModal();
        expect(wrapper.state('showConfirmModal')).toBe(false);

        wrapper.setProps({
            currentChannelMembersCount: 2
        });

        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(false);
    });

    it('onSubmit test for "/header" message', () => {
        const wrapper = shallow(createPost());

        wrapper.setState({
            message: '/header'
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(GlobalActions.showChannelHeaderUpdateModal).toHaveBeenCalledWith(currentChannelProp);
    });

    it('onSubmit test for "/purpose" message', () => {
        const wrapper = shallow(createPost());

        wrapper.setState({
            message: '/purpose'
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(GlobalActions.showChannelPurposeUpdateModal).toHaveBeenCalledWith(currentChannelProp);
    });

    it('onSubmit test for "/rename" message', () => {
        const wrapper = shallow(createPost());

        wrapper.setState({
            message: '/rename'
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(GlobalActions.showChannelNameUpdateModal).toHaveBeenCalledWith(currentChannelProp);
    });

    it('onSubmit test for "/purpose" message', () => {
        const wrapper = shallow(createPost());

        wrapper.setState({
            message: '/purpose'
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(GlobalActions.showChannelPurposeUpdateModal).toHaveBeenCalledWith(currentChannelProp);
    });

    it('onSubmit test for "/unknown" message ', () => {
        jest.mock('actions/channel_actions.jsx', () => ({
            executeCommand: jest.fn((message, _args, resolve) => resolve())
        }));

        const wrapper = shallow(createPost());

        wrapper.setState({
            message: '/unknown'
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('submitting')).toBe(false);
    });

    it('onSubmit test for addReaction message', () => {
        const addReaction = jest.fn();

        const wrapper = shallow(
            createPost({
                actions: {
                    ...actionsProp,
                    addReaction
                }
            })
        );

        wrapper.setState({
            message: '+:smile:'
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(addReaction).toHaveBeenCalledWith('a', 'smile');
    });

    it('onSubmit test for removeReaction message', () => {
        const removeReaction = jest.fn();

        const wrapper = shallow(
            createPost({
                actions: {
                    ...actionsProp,
                    removeReaction
                }
            })
        );

        wrapper.setState({
            message: '-:smile:'
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(removeReaction).toHaveBeenCalledWith('a', 'smile');
    });

    it('check for postError state on handlePostError callback', () => {
        const createPostAction = jest.fn(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }
        );

        const wrapper = shallow(
            createPost({
                actions: {
                    ...actionsProp,
                    createPost: createPostAction
                }
            })
        );
        const textBox = wrapper.find('#post_textbox');
        const form = wrapper.find('#create_post');

        textBox.prop('handlePostError')(true);
        expect(wrapper.state('postError')).toBe(true);

        wrapper.setState({
            message: 'test'
        });

        form.simulate('Submit', {preventDefault: jest.fn()});

        expect(wrapper.update().find('.post-error .animation--highlight').length).toBe(1);
        expect(wrapper.find('#postCreateFooter').hasClass('post-create-footer has-error')).toBe(true);
    });

    it('check for handleFileUploadChange callbak for focus', () => {
        const wrapper = mountWithIntl(createPost());
        const instance = wrapper.instance();
        const ref = wrapper.ref('textbox');

        ref.focus = jest.fn();
        instance.handleFileUploadChange();
        expect(ref.focus).toBeCalled();
    });

    it('check for handleFileUploadStart callbak', () => {
        const setDraft = jest.fn();

        const wrapper = shallow(
            createPost({
                actions: {
                    ...actionsProp,
                    setDraft
                }
            })
        );

        const instance = wrapper.instance();
        const clientIds = ['a'];
        const draft = {
            ...draftProp,
            uploadsInProgress: [
                ...draftProp.uploadsInProgress,
                ...clientIds
            ]
        };

        instance.handleUploadStart(clientIds, currentChannelProp.id);
        expect(setDraft).toHaveBeenCalledWith(StoragePrefixes.DRAFT + currentChannelProp.id, draft);
    });

    it('check for handleFileUploadComplete callbak', () => {
        const setDraft = jest.fn();

        const wrapper = shallow(
            createPost({
                actions: {
                    ...actionsProp,
                    setDraft
                }
            })
        );

        const instance = wrapper.instance();
        const clientIds = ['a'];
        const uploadsInProgressDraft = {
            ...draftProp,
            uploadsInProgress: [
                ...draftProp.uploadsInProgress,
                'a'
            ]
        };

        wrapper.setProps({draft: uploadsInProgressDraft});
        const fileInfos = {
            id: 'a'
        };
        const expectedDraft = {
            ...draftProp,
            fileInfos: [
                ...draftProp.fileInfos,
                fileInfos
            ]
        };

        instance.handleFileUploadComplete(fileInfos, clientIds, currentChannelProp.id);
        expect(setDraft).toHaveBeenCalledWith(StoragePrefixes.DRAFT + currentChannelProp.id, expectedDraft);
    });

    it('check for handleUploadError callbak', () => {
        const setDraft = jest.fn();

        const wrapper = shallow(
            createPost({
                actions: {
                    ...actionsProp,
                    setDraft
                }
            })
        );

        const instance = wrapper.instance();
        const uploadsInProgressDraft = {
            ...draftProp,
            uploadsInProgress: [
                ...draftProp.uploadsInProgress,
                'a'
            ]
        };

        wrapper.setProps({draft: uploadsInProgressDraft});

        instance.handleUploadError('error message', 'a', currentChannelProp.id);

        expect(setDraft).toHaveBeenCalledWith(StoragePrefixes.DRAFT + currentChannelProp.id, draftProp);
    });

    it('Remove preview from fileInfos', () => {
        const setDraft = jest.fn();
        const fileInfos = {
            id: 'a',
            extension: 'jpg'
        };
        const uploadsInProgressDraft = {
            ...draftProp,
            fileInfos: [
                ...draftProp.fileInfos,
                fileInfos
            ]
        };

        const wrapper = mountWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    setDraft
                },
                draft: {
                    ...draftProp,
                    ...uploadsInProgressDraft
                }
            })
        );

        const instance = wrapper.instance();
        const ref = wrapper.find('FilePreview');
        const cancelUpload = jest.fn();
        ref.getWrappedInstance = () => ({
            cancelUpload
        });

        instance.removePreview('a');
        expect(setDraft).toHaveBeenCalledWith(StoragePrefixes.DRAFT + currentChannelProp.id, draftProp);
    });

    it('Should call Shortcut modal on FORWARD_SLASH+cntrl/meta', () => {
        const wrapper = shallow(createPost());
        const instance = wrapper.instance();
        instance.showShortcuts({ctrlKey: true, keyCode: Constants.KeyCodes.BACK_SLASH, preventDefault: jest.fn()});
        expect(GlobalActions.toggleShortcutsModal).not.toHaveBeenCalled();
        instance.showShortcuts({ctrlKey: true, keyCode: Constants.KeyCodes.FORWARD_SLASH, preventDefault: jest.fn()});
        expect(GlobalActions.toggleShortcutsModal).toHaveBeenCalled();
    });

    it('Should just return as ctrlSend is enabled and its ctrl+enter', () => {
        const wrapper = shallow(createPost({
            ctrlSend: true
        }));
        const instance = wrapper.instance();
        instance.handleKeyDown({ctrlKey: true, keyCode: Constants.KeyCodes.ENTER});
        expect(GlobalActions.emitLocalUserTypingEvent).toHaveBeenCalledWith(currentChannelProp.id, '');
    });

    it('Should call edit action as comment for arrow up', () => {
        const setEditingPost = jest.fn();
        const wrapper = shallow(createPost({
            actions: {
                ...actionsProp,
                setEditingPost
            }
        }));
        const instance = wrapper.instance();
        const type = Utils.localizeMessage('create_post.comment', Posts.MESSAGE_TYPES.COMMENT);
        instance.handleKeyDown({keyCode: Constants.KeyCodes.UP, preventDefault: jest.fn()});
        expect(setEditingPost).toHaveBeenCalledWith(currentUsersLatestPostProp.id, commentCountForPostProp, '#post_textbox', type);
    });

    it('Should call edit action as post for arrow up', () => {
        const setEditingPost = jest.fn();
        const wrapper = shallow(createPost({
            actions: {
                ...actionsProp,
                setEditingPost
            }
        }));
        const instance = wrapper.instance();

        wrapper.setProps({
            currentUsersLatestPost: {id: 'b', channel_id: currentChannelProp.id}
        });

        const type = Utils.localizeMessage('create_post.post', Posts.MESSAGE_TYPES.POST);
        instance.handleKeyDown({keyCode: Constants.KeyCodes.UP, preventDefault: jest.fn()});
        expect(setEditingPost).toHaveBeenCalledWith(currentUsersLatestPostProp.id, commentCountForPostProp, '#post_textbox', type);
    });

    it('Should call moveHistoryIndexForward as ctrlKey and down arrow', () => {
        const moveHistoryIndexForward = jest.fn(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }
        );
        const wrapper = shallow(createPost({
            actions: {
                ...actionsProp,
                moveHistoryIndexForward
            }
        }));
        const instance = wrapper.instance();

        instance.handleKeyDown({keyCode: Constants.KeyCodes.DOWN, ctrlKey: true, preventDefault: jest.fn()});
        expect(moveHistoryIndexForward).toHaveBeenCalled();
    });

    it('Should call moveHistoryIndexBack as ctrlKey and up arrow', () => {
        const moveHistoryIndexBack = jest.fn(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }
        );
        const wrapper = shallow(createPost({
            actions: {
                ...actionsProp,
                moveHistoryIndexBack
            }
        }));
        const instance = wrapper.instance();

        instance.handleKeyDown({keyCode: Constants.KeyCodes.UP, ctrlKey: true, preventDefault: jest.fn()});
        expect(moveHistoryIndexBack).toHaveBeenCalled();
    });

    it('Show tutorial', () => {
        const wrapper = shallow(createPost({
            showTutorialTip: '1'
        }));
        expect(wrapper.find('TutorialTip').length).toBe(1);
    });

    it('Toggle showPostDeletedModal state', () => {
        const wrapper = shallow(createPost());
        const instance = wrapper.instance();
        instance.showPostDeletedModal();
        expect(wrapper.state('showPostDeletedModal')).toBe(true);

        instance.hidePostDeletedModal();
        expect(wrapper.state('showPostDeletedModal')).toBe(false);
    });
});
