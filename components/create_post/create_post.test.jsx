// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Posts} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import {testComponentForLineBreak} from 'tests/helpers/line_break_helpers';
import {testComponentForMarkdownHotkeys, makeSelectionEvent} from 'tests/helpers/markdown_hotkey_helpers.js';
import * as GlobalActions from 'actions/global_actions.jsx';
import EmojiMap from 'utils/emoji_map';

import Constants, {StoragePrefixes, ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import CreatePost from 'components/create_post/create_post.jsx';
import FileUpload from 'components/file_upload';
import Textbox from 'components/textbox';

jest.mock('actions/global_actions.jsx', () => ({
    emitLocalUserTypingEvent: jest.fn(),
    emitUserPostedEvent: jest.fn(),
    showChannelNameUpdateModal: jest.fn(),
    toggleShortcutsModal: jest.fn(),
}));

jest.mock('actions/post_actions.jsx', () => ({
    createPost: jest.fn(() => {
        return new Promise((resolve) => {
            process.nextTick(() => resolve());
        });
    }),
}));

const currentTeamIdProp = 'r7rws4y7ppgszym3pdd5kaibfa';
const currentUserIdProp = 'zaktnt8bpbgu8mb6ez9k64r7sa';
const showTutorialTipProp = false;
const fullWidthTextBoxProp = true;
const recentPostIdInChannelProp = 'a';
const latestReplyablePostIdProp = 'a';
const localeProp = 'en';

const currentChannelProp = {
    id: 'owsyt8n43jfxjpzh9np93mx1wa',
    type: 'O',
};
const currentChannelMembersCountProp = 9;
const draftProp = {
    message: '',
    uploadsInProgress: [],
    fileInfos: [],
};

const ctrlSendProp = false;

const currentUsersLatestPostProp = {id: 'b', root_id: 'a', channel_id: currentChannelProp.id};

const commentCountForPostProp = 10;

const actionsProp = {
    addMessageIntoHistory: jest.fn(),
    moveHistoryIndexBack: jest.fn(),
    moveHistoryIndexForward: jest.fn(),
    addReaction: jest.fn(),
    removeReaction: jest.fn(),
    clearDraftUploads: jest.fn(),
    onSubmitPost: jest.fn(),
    selectPostFromRightHandSideSearchByPostId: jest.fn(),
    setDraft: jest.fn(),
    setEditingPost: jest.fn(),
    openModal: jest.fn(),
    setShowPreview: jest.fn(),
    executeCommand: async () => {
        return {data: true};
    },
    getChannelTimezones: jest.fn(),
    runMessageWillBePostedHooks: async (post) => {
        return {data: post};
    },
    runSlashCommandWillBePostedHooks: async (message, args) => {
        return {data: {message, args}};
    },
    scrollPostListToBottom: jest.fn(),
    getChannelMemberCountsByGroup: jest.fn(),
};

/* eslint-disable react/prop-types */
function createPost({
    currentChannel = currentChannelProp,
    currentTeamId = currentTeamIdProp,
    currentUserId = currentUserIdProp,
    showTutorialTip = showTutorialTipProp,
    currentChannelMembersCount = currentChannelMembersCountProp,
    fullWidthTextBox = fullWidthTextBoxProp,
    draft = draftProp,
    recentPostIdInChannel = recentPostIdInChannelProp,
    latestReplyablePostId = latestReplyablePostIdProp,
    locale = localeProp,
    actions = actionsProp,
    ctrlSend = ctrlSendProp,
    currentUsersLatestPost = currentUsersLatestPostProp,
    commentCountForPost = commentCountForPostProp,
    readOnlyChannel = false,
    canUploadFiles = true,
    emojiMap = new EmojiMap(new Map()),
    isTimezoneEnabled = false,
    useGroupMentions = true,
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
            latestReplyablePostId={latestReplyablePostId}
            locale={locale}
            ctrlSend={ctrlSend}
            currentUsersLatestPost={currentUsersLatestPost}
            commentCountForPost={commentCountForPost}
            actions={actions}
            readOnlyChannel={readOnlyChannel}
            canUploadFiles={canUploadFiles}
            enableTutorial={true}
            enableConfirmNotificationsToChannel={true}
            enableEmojiPicker={true}
            enableGifPicker={true}
            maxPostSize={Constants.DEFAULT_CHARACTER_LIMIT}
            userIsOutOfOffice={false}
            rhsExpanded={false}
            emojiMap={emojiMap}
            badConnection={false}
            shouldShowPreview={false}
            isTimezoneEnabled={isTimezoneEnabled}
            canPost={true}
            useChannelMentions={true}
            useGroupMentions={useGroupMentions}
        />
    );
}
/* eslint-enable react/prop-types */

describe('components/create_post', () => {
    jest.useFakeTimers();
    beforeEach(() => {
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 16));
    });

    afterEach(() => {
        window.requestAnimationFrame.mockRestore();
    });

    it('should match snapshot, init', () => {
        const wrapper = shallowWithIntl(createPost({}));

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for center textbox', () => {
        const wrapper = shallowWithIntl(createPost({fullWidthTextBox: false}));

        expect(wrapper.find('#create_post').hasClass('center')).toBe(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('should call clearDraftUploads on mount', () => {
        const clearDraftUploads = jest.fn();
        const actions = {
            ...actionsProp,
            clearDraftUploads,
        };

        shallowWithIntl(createPost({actions}));

        expect(clearDraftUploads).toHaveBeenCalled();
    });

    it('Check for state change on channelId change with useGroupMentions = true', () => {
        const wrapper = shallowWithIntl(createPost({}));
        const draft = {
            ...draftProp,
            message: 'test',
        };

        expect(wrapper.state('message')).toBe('');

        wrapper.setProps({draft});
        expect(wrapper.state('message')).toBe('');

        wrapper.setProps({
            currentChannel: {
                ...currentChannelProp,
                id: 'owsyt8n43jfxjpzh9np93mx1wb',
            },
        });
        expect(wrapper.state('message')).toBe('test');
    });

    it('Check for getChannelMemberCountsByGroup called on mount and when channel changed with useGroupMentions = true', () => {
        const getChannelMemberCountsByGroup = jest.fn();
        const actions = {
            ...actionsProp,
            getChannelMemberCountsByGroup,
        };
        const wrapper = shallowWithIntl(createPost({actions}));
        expect(getChannelMemberCountsByGroup).toHaveBeenCalled();
        wrapper.setProps({
            currentChannel: {
                ...currentChannelProp,
                id: 'owsyt8n43jfxjpzh9np93mx1wb',
            },
        });
        expect(getChannelMemberCountsByGroup).toHaveBeenCalled();
    });

    it('Check for getChannelMemberCountsByGroup not called on mount and when channel changed with useGroupMentions = false', () => {
        const getChannelMemberCountsByGroup = jest.fn();
        const useGroupMentions = false;
        const actions = {
            ...actionsProp,
            getChannelMemberCountsByGroup,
        };
        const wrapper = shallowWithIntl(createPost({actions, useGroupMentions}));
        expect(getChannelMemberCountsByGroup).not.toHaveBeenCalled();
        wrapper.setProps({
            currentChannel: {
                ...currentChannelProp,
                id: 'owsyt8n43jfxjpzh9np93mx1wb',
            },
        });
        expect(getChannelMemberCountsByGroup).not.toHaveBeenCalled();
    });

    it('click toggleEmojiPicker', () => {
        const wrapper = shallowWithIntl(createPost());
        wrapper.find('.emoji-picker__container').simulate('click');
        expect(wrapper.state('showEmojiPicker')).toBe(true);
        wrapper.find('.emoji-picker__container').simulate('click');
        wrapper.find('EmojiPickerOverlay').prop('onHide')();
        expect(wrapper.state('showEmojiPicker')).toBe(false);
    });

    it('Check for emoji click message states', () => {
        const wrapper = shallowWithIntl(createPost());
        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                focus: jest.fn(),
            };
        };
        wrapper.instance().textboxRef.current = {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()};

        wrapper.find('.emoji-picker__container').simulate('click');
        expect(wrapper.state('showEmojiPicker')).toBe(true);

        wrapper.instance().handleEmojiClick({name: 'smile'});
        expect(wrapper.state('message')).toBe(':smile: ');

        wrapper.setState({
            message: 'test',
            caretPosition: 'test'.length, // cursor is at the end
        });

        wrapper.instance().handleEmojiClick({name: 'smile'});
        expect(wrapper.state('message')).toBe('test :smile: ');

        wrapper.setState({
            message: 'test ',
        });

        wrapper.instance().handleEmojiClick({name: 'smile'});
        expect(wrapper.state('message')).toBe('test  :smile: ');
    });

    it('onChange textbox should call setDraft and change message state', () => {
        const setDraft = jest.fn();
        const draft = {
            ...draftProp,
            message: 'change',
        };

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    setDraft,
                },
            }),
        );

        const postTextbox = wrapper.find('#post_textbox');
        postTextbox.simulate('change', {target: {value: 'change'}});
        expect(setDraft).not.toHaveBeenCalled();
        jest.runOnlyPendingTimers();
        expect(setDraft).toHaveBeenCalledWith(StoragePrefixes.DRAFT + currentChannelProp.id, draft);
    });

    it('onKeyPress textbox should call emitLocalUserTypingEvent', () => {
        const wrapper = shallowWithIntl(createPost());
        wrapper.instance().textboxRef.current = {blur: jest.fn()};

        const postTextbox = wrapper.find('#post_textbox');
        postTextbox.simulate('KeyPress', {key: Constants.KeyCodes.ENTER[0], preventDefault: jest.fn(), persist: jest.fn()});
        expect(GlobalActions.emitLocalUserTypingEvent).toHaveBeenCalledWith(currentChannelProp.id, '');
    });

    it('onSubmit test for @all', () => {
        const wrapper = shallowWithIntl(createPost());

        wrapper.setState({
            message: 'test @all',
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(true);
        wrapper.instance().hideNotifyAllModal();
        expect(wrapper.state('showConfirmModal')).toBe(false);

        wrapper.setProps({
            currentChannelMembersCount: 2,
        });

        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(false);
    });

    it('onSubmit test for @groups', () => {
        const wrapper = shallowWithIntl(createPost());

        wrapper.setProps({
            groupsWithAllowReference: new Map([
                ['@developers', {
                    id: 'developers',
                    name: 'developers',
                }],
            ]),
            channelMemberCountsByGroup: {
                developers: {
                    channel_member_count: 10,
                    channel_member_timezones_count: 0,
                },
            },
        });
        wrapper.setState({
            message: '@developers',
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(true);
        expect(wrapper.state('memberNotifyCount')).toBe(10);
        expect(wrapper.state('channelTimezoneCount')).toBe(0);
        expect(wrapper.state('mentions')).toMatchObject(['@developers']);
        wrapper.instance().hideNotifyAllModal();
        expect(wrapper.state('showConfirmModal')).toBe(false);
    });

    it('onSubmit test for several @groups', () => {
        const wrapper = shallowWithIntl(createPost());

        wrapper.setProps({
            groupsWithAllowReference: new Map([
                ['@developers', {
                    id: 'developers',
                    name: 'developers',
                }],
                ['@boss', {
                    id: 'boss',
                    name: 'boss',
                }],
                ['@love', {
                    id: 'love',
                    name: 'love',
                }],
                ['@you', {
                    id: 'you',
                    name: 'you',
                }],
                ['@software-developers', {
                    id: 'softwareDevelopers',
                    name: 'software-developers',
                }],
            ]),
            channelMemberCountsByGroup: {
                developers: {
                    channel_member_count: 10,
                    channel_member_timezones_count: 0,
                },
                boss: {
                    channel_member_count: 20,
                    channel_member_timezones_count: 0,
                },
                love: {
                    channel_member_count: 30,
                    channel_member_timezones_count: 0,
                },
                you: {
                    channel_member_count: 40,
                    channel_member_timezones_count: 0,
                },
                softwareDevelopers: {
                    channel_member_count: 5,
                    channel_member_timezones_count: 0,
                },
            },
        });
        wrapper.setState({
            message: '@developers @boss @love @you @software-developers',
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(true);
        expect(wrapper.state('memberNotifyCount')).toBe(40);
        expect(wrapper.state('channelTimezoneCount')).toBe(0);
        expect(wrapper.state('mentions')).toMatchObject(['@developers', '@boss', '@love', '@you', '@software-developers']);
        wrapper.instance().hideNotifyAllModal();
        expect(wrapper.state('showConfirmModal')).toBe(false);
    });

    it('onSubmit test for several @groups with timezone', () => {
        const wrapper = shallowWithIntl(createPost());

        wrapper.setProps({
            groupsWithAllowReference: new Map([
                ['@developers', {
                    id: 'developers',
                    name: 'developers',
                }],
                ['@boss', {
                    id: 'boss',
                    name: 'boss',
                }],
                ['@love', {
                    id: 'love',
                    name: 'love',
                }],
                ['@you', {
                    id: 'you',
                    name: 'you',
                }],
            ]),
            channelMemberCountsByGroup: {
                developers: {
                    channel_member_count: 10,
                    channel_member_timezones_count: 10,
                },
                boss: {
                    channel_member_count: 20,
                    channel_member_timezones_count: 130,
                },
                love: {
                    channel_member_count: 30,
                    channel_member_timezones_count: 2,
                },
                you: {
                    channel_member_count: 40,
                    channel_member_timezones_count: 5,
                },
            },
        });
        wrapper.setState({
            message: '@developers @boss @love @you',
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(true);
        expect(wrapper.state('memberNotifyCount')).toBe(40);
        expect(wrapper.state('channelTimezoneCount')).toBe(5);
        expect(wrapper.state('mentions')).toMatchObject(['@developers', '@boss', '@love', '@you']);
        wrapper.instance().hideNotifyAllModal();
        expect(wrapper.state('showConfirmModal')).toBe(false);
    });

    it('Should set mentionHighlightDisabled prop when useChannelMentions disabled before calling actions.onSubmitPost', async () => {
        const onSubmitPost = jest.fn();
        const wrapper = shallowWithIntl(createPost({
            actions: {
                ...actionsProp,
                onSubmitPost,
            },
        }));

        wrapper.setProps({
            useChannelMentions: false,
        });

        const post = {message: 'message with @here mention'};
        await wrapper.instance().sendMessage(post);

        expect(onSubmitPost).toHaveBeenCalledTimes(1);
        expect(onSubmitPost.mock.calls[0][0]).toEqual({...post, props: {mentionHighlightDisabled: true}});
    });

    it('Should not set mentionHighlightDisabled prop when useChannelMentions enabled before calling actions.onSubmitPost', async () => {
        const onSubmitPost = jest.fn();
        const wrapper = shallowWithIntl(createPost({
            actions: {
                ...actionsProp,
                onSubmitPost,
            },
        }));

        wrapper.setProps({
            useChannelMentions: true,
        });

        const post = {message: 'message with @here mention'};
        await wrapper.instance().sendMessage(post);

        expect(onSubmitPost).toHaveBeenCalledTimes(1);
        expect(onSubmitPost.mock.calls[0][0]).toEqual(post);
    });

    it('Should not set mentionHighlightDisabled prop when useChannelMentions disabled but message does not contain channel metion before calling actions.onSubmitPost', async () => {
        const onSubmitPost = jest.fn();
        const wrapper = shallowWithIntl(createPost({
            actions: {
                ...actionsProp,
                onSubmitPost,
            },
        }));

        wrapper.setProps({
            useChannelMentions: false,
        });

        const post = {message: 'message without mention'};
        await wrapper.instance().sendMessage(post);

        expect(onSubmitPost).toHaveBeenCalledTimes(1);
        expect(onSubmitPost.mock.calls[0][0]).toEqual(post);
    });

    it('onSubmit test for @all with timezones', () => {
        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    getChannelTimezones: jest.fn(() => Promise.resolve({data: [1, 2, 3, 4]})),
                },
                isTimezoneEnabled: true,
                currentChannelMembersCount: 9,
            }),
        );

        wrapper.setState({
            message: 'test @all',
            channelTimezoneCount: 4,
            showConfirmModal: true,
            memberNotifyCount: 8,
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(true);
        expect(wrapper.state('channelTimezoneCount')).toBe(4);
        expect(wrapper.state('memberNotifyCount')).toBe(8);
        wrapper.instance().hideNotifyAllModal();
        expect(wrapper.state('showConfirmModal')).toBe(false);

        wrapper.setProps({
            currentChannelMembersCount: 2,
        });

        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(false);
    });

    it('onSubmit test for @all with timezones disabled', () => {
        const wrapper = shallowWithIntl(
            createPost({
                getChannelTimezones: jest.fn(() => Promise.resolve([])),
                isTimezoneEnabled: false,
            }),
        );

        wrapper.setState({
            message: 'test @all',
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(true);
        expect(wrapper.state('channelTimezoneCount')).toBe(0);
        wrapper.instance().hideNotifyAllModal();
        expect(wrapper.state('showConfirmModal')).toBe(false);

        wrapper.setProps({
            currentChannelMembersCount: 2,
        });

        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(wrapper.state('showConfirmModal')).toBe(false);
    });

    it('onSubmit test for "/header" message', () => {
        const openModal = jest.fn();

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    openModal,
                },
            }),
        );

        wrapper.setState({
            message: '/header',
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(openModal).toHaveBeenCalledTimes(1);
        expect(openModal.mock.calls[0][0].modalId).toEqual(ModalIdentifiers.EDIT_CHANNEL_HEADER);
        expect(openModal.mock.calls[0][0].dialogProps.channel).toEqual(currentChannelProp);
    });

    it('onSubmit test for "/purpose" message', () => {
        const openModal = jest.fn();

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    openModal,
                },
            }),
        );

        wrapper.setState({
            message: '/purpose',
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(openModal).toHaveBeenCalledTimes(1);
        expect(openModal.mock.calls[0][0].modalId).toEqual(ModalIdentifiers.EDIT_CHANNEL_PURPOSE);
        expect(openModal.mock.calls[0][0].dialogProps.channel).toEqual(currentChannelProp);
    });

    it('onSubmit test for "/rename" message', () => {
        const wrapper = shallowWithIntl(createPost());

        wrapper.setState({
            message: '/rename',
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(GlobalActions.showChannelNameUpdateModal).toHaveBeenCalledWith(currentChannelProp);
    });

    it('onSubmit test for "/unknown" message ', async () => {
        jest.mock('actions/channel_actions.jsx', () => ({
            executeCommand: jest.fn((message, _args, resolve) => resolve()),
        }));

        const wrapper = shallowWithIntl(createPost());

        wrapper.setState({
            message: '/unknown',
        });

        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(wrapper.state('submitting')).toBe(false);
    });

    it('onSubmit test for addReaction message', async () => {
        const addReaction = jest.fn();

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    addReaction,
                },
            }),
        );

        wrapper.setState({
            message: '+:smile:',
        });

        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(addReaction).toHaveBeenCalledWith('a', 'smile');
    });

    it('onSubmit test for removeReaction message', () => {
        const removeReaction = jest.fn();

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    removeReaction,
                },
            }),
        );

        wrapper.setState({
            message: '-:smile:',
        });

        const form = wrapper.find('#create_post');
        form.simulate('Submit', {preventDefault: jest.fn()});
        expect(removeReaction).toHaveBeenCalledWith('a', 'smile');
    });

    /*it('check for postError state on handlePostError callback', () => {
        const wrapper = shallowWithIntl(createPost());
        const textBox = wrapper.find('#post_textbox');
        const form = wrapper.find('#create_post');

        textBox.prop('handlePostError')(true);
        expect(wrapper.state('postError')).toBe(true);

        wrapper.setState({
            message: 'test',
        });

        form.simulate('Submit', {preventDefault: jest.fn()});

        expect(wrapper.update().find('.post-error .animation--highlight').length).toBe(1);
        expect(wrapper.find('#postCreateFooter').hasClass('post-create-footer has-error')).toBe(true);
    });*/

    it('check for handleFileUploadChange callback for focus', () => {
        const wrapper = shallowWithIntl(createPost());
        const instance = wrapper.instance();
        instance.focusTextbox = jest.fn();

        instance.handleFileUploadChange();
        expect(instance.focusTextbox).toHaveBeenCalledTimes(1);
    });

    it('check for handleFileUploadStart callback', () => {
        const setDraft = jest.fn();

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    setDraft,
                },
            }),
        );

        const instance = wrapper.instance();
        const clientIds = ['a'];
        const draft = {
            ...draftProp,
            uploadsInProgress: [
                ...draftProp.uploadsInProgress,
                ...clientIds,
            ],
        };

        instance.handleUploadStart(clientIds, currentChannelProp.id);
        expect(setDraft).toHaveBeenCalledWith(StoragePrefixes.DRAFT + currentChannelProp.id, draft);
    });

    it('check for handleFileUploadComplete callback', () => {
        const setDraft = jest.fn();

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    setDraft,
                },
            }),
        );

        const instance = wrapper.instance();
        const clientIds = ['a'];
        const uploadsInProgressDraft = {
            ...draftProp,
            uploadsInProgress: [
                ...draftProp.uploadsInProgress,
                'a',
            ],
        };

        instance.draftsForChannel[currentChannelProp.id] = uploadsInProgressDraft;

        wrapper.setProps({draft: uploadsInProgressDraft});
        const fileInfos = {
            id: 'a',
        };
        const expectedDraft = {
            ...draftProp,
            fileInfos: [
                ...draftProp.fileInfos,
                fileInfos,
            ],
        };

        instance.handleFileUploadComplete(fileInfos, clientIds, currentChannelProp.id);
        expect(setDraft).toHaveBeenCalledWith(StoragePrefixes.DRAFT + currentChannelProp.id, expectedDraft);
    });

    it('check for handleUploadError callback', () => {
        const setDraft = jest.fn();

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    setDraft,
                },
            }),
        );

        const instance = wrapper.instance();
        const uploadsInProgressDraft = {
            ...draftProp,
            uploadsInProgress: [
                ...draftProp.uploadsInProgress,
                'a',
            ],
        };

        wrapper.setProps({draft: uploadsInProgressDraft});

        instance.draftsForChannel[currentChannelProp.id] = uploadsInProgressDraft;
        instance.handleUploadError('error message', 'a', currentChannelProp.id);

        expect(setDraft).toHaveBeenCalledWith(StoragePrefixes.DRAFT + currentChannelProp.id, draftProp);
    });

    it('check for uploadsProgressPercent state on handleUploadProgress callback', () => {
        const wrapper = shallowWithIntl(createPost({}));
        wrapper.find(FileUpload).prop('onUploadProgress')({clientId: 'clientId', name: 'name', percent: 10, type: 'type'});

        expect(wrapper.state('uploadsProgressPercent')).toEqual({clientId: {percent: 10, name: 'name', type: 'type'}});
    });

    it('Remove preview from fileInfos', () => {
        const setDraft = jest.fn();
        const fileInfos = {
            id: 'a',
            extension: 'jpg',
            name: 'trimmedFilename',
        };
        const uploadsInProgressDraft = {
            ...draftProp,
            fileInfos: [
                ...draftProp.fileInfos,
                fileInfos,
            ],
        };

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    setDraft,
                },
                draft: {
                    ...draftProp,
                    ...uploadsInProgressDraft,
                },
            }),
        );

        const instance = wrapper.instance();
        instance.handleFileUploadChange = jest.fn();
        instance.removePreview('a');
        expect(setDraft).toHaveBeenCalledTimes(1);
        expect(setDraft).toHaveBeenCalledWith(StoragePrefixes.DRAFT + currentChannelProp.id, draftProp);
        expect(instance.handleFileUploadChange).toHaveBeenCalledTimes(1);
    });

    it('Should call Shortcut modal on FORWARD_SLASH+cntrl/meta', () => {
        const wrapper = shallowWithIntl(createPost());
        const instance = wrapper.instance();
        instance.documentKeyHandler({ctrlKey: true, key: Constants.KeyCodes.BACK_SLASH[0], keyCode: Constants.KeyCodes.BACK_SLASH[1], preventDefault: jest.fn()});
        expect(GlobalActions.toggleShortcutsModal).not.toHaveBeenCalled();
        instance.documentKeyHandler({ctrlKey: true, key: 'ù', keyCode: Constants.KeyCodes.FORWARD_SLASH[1], preventDefault: jest.fn()});
        expect(GlobalActions.toggleShortcutsModal).toHaveBeenCalled();
        instance.documentKeyHandler({ctrlKey: true, key: '/', keyCode: Constants.KeyCodes.SEVEN[1], preventDefault: jest.fn()});
        expect(GlobalActions.toggleShortcutsModal).toHaveBeenCalled();
        instance.documentKeyHandler({ctrlKey: true, key: Constants.KeyCodes.FORWARD_SLASH[0], keyCode: Constants.KeyCodes.FORWARD_SLASH[1], preventDefault: jest.fn()});
        expect(GlobalActions.toggleShortcutsModal).toHaveBeenCalled();
    });

    it('Should just return as ctrlSend is enabled and its ctrl+enter', () => {
        const wrapper = shallowWithIntl(createPost({
            ctrlSend: true,
        }));

        const instance = wrapper.instance();
        instance.textboxRef.current = {blur: jest.fn()};

        instance.handleKeyDown({ctrlKey: true, key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], preventDefault: jest.fn(), persist: jest.fn()});
        setTimeout(() => {
            expect(GlobalActions.emitLocalUserTypingEvent).toHaveBeenCalledWith(currentChannelProp.id, '');
        }, 0);
    });

    it('Should call edit action as comment for arrow up', () => {
        const setEditingPost = jest.fn();
        const wrapper = shallowWithIntl(createPost({
            actions: {
                ...actionsProp,
                setEditingPost,
            },
        }));
        const instance = wrapper.instance();
        const type = Utils.localizeMessage('create_post.comment', Posts.MESSAGE_TYPES.COMMENT);
        instance.handleKeyDown({key: Constants.KeyCodes.UP[0], preventDefault: jest.fn()});
        expect(setEditingPost).toHaveBeenCalledWith(currentUsersLatestPostProp.id, commentCountForPostProp, 'post_textbox', type);
    });

    it('Should call edit action as post for arrow up', () => {
        const setEditingPost = jest.fn();
        const wrapper = shallowWithIntl(createPost({
            actions: {
                ...actionsProp,
                setEditingPost,
            },
        }));
        const instance = wrapper.instance();

        wrapper.setProps({
            currentUsersLatestPost: {id: 'b', channel_id: currentChannelProp.id},
        });

        const type = Utils.localizeMessage('create_post.post', Posts.MESSAGE_TYPES.POST);
        instance.handleKeyDown({key: Constants.KeyCodes.UP[0], preventDefault: jest.fn()});
        expect(setEditingPost).toHaveBeenCalledWith(currentUsersLatestPostProp.id, commentCountForPostProp, 'post_textbox', type);
    });

    it('Should call moveHistoryIndexForward as ctrlKey and down arrow', () => {
        const moveHistoryIndexForward = jest.fn(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            },
        );
        const wrapper = shallowWithIntl(createPost({
            actions: {
                ...actionsProp,
                moveHistoryIndexForward,
            },
        }));
        const instance = wrapper.instance();

        instance.handleKeyDown({key: Constants.KeyCodes.DOWN[0], ctrlKey: true, preventDefault: jest.fn()});
        expect(moveHistoryIndexForward).toHaveBeenCalled();
    });

    it('Should call moveHistoryIndexBack as ctrlKey and up arrow', () => {
        const moveHistoryIndexBack = jest.fn(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            },
        );
        const wrapper = shallowWithIntl(createPost({
            actions: {
                ...actionsProp,
                moveHistoryIndexBack,
            },
        }));
        const instance = wrapper.instance();

        instance.handleKeyDown({key: Constants.KeyCodes.UP[0], ctrlKey: true, preventDefault: jest.fn()});
        expect(moveHistoryIndexBack).toHaveBeenCalled();
    });

    it('Show tutorial', () => {
        const wrapper = shallowWithIntl(createPost({
            showTutorialTip: true,
        }));
        expect(wrapper).toMatchSnapshot();
    });

    it('Toggle showPostDeletedModal state', () => {
        const wrapper = shallowWithIntl(createPost());
        const instance = wrapper.instance();
        instance.showPostDeletedModal();
        expect(wrapper.state('showPostDeletedModal')).toBe(true);

        instance.hidePostDeletedModal();
        expect(wrapper.state('showPostDeletedModal')).toBe(false);
    });

    it('Should have called actions.onSubmitPost on sendMessage', async () => {
        const onSubmitPost = jest.fn();
        const wrapper = shallowWithIntl(createPost({
            actions: {
                ...actionsProp,
                onSubmitPost,
            },
        }));
        const post = {message: 'message', file_ids: []};
        await wrapper.instance().sendMessage(post);

        expect(onSubmitPost).toHaveBeenCalledTimes(1);
        expect(onSubmitPost.mock.calls[0][0]).toEqual(post);
        expect(onSubmitPost.mock.calls[0][1]).toEqual([]);
    });

    it('Should have called actions.selectPostFromRightHandSideSearchByPostId on replyToLastPost', () => {
        const selectPostFromRightHandSideSearchByPostId = jest.fn();
        let latestReplyablePostId = '';
        const wrapper = shallowWithIntl(createPost({
            actions: {
                ...actionsProp,
                selectPostFromRightHandSideSearchByPostId,
            },
            latestReplyablePostId,
        }));

        wrapper.instance().replyToLastPost({preventDefault: jest.fn()});
        expect(selectPostFromRightHandSideSearchByPostId).not.toBeCalled();

        latestReplyablePostId = 'latest_replyablePost_id';
        wrapper.setProps({latestReplyablePostId});
        wrapper.instance().replyToLastPost({preventDefault: jest.fn()});
        expect(selectPostFromRightHandSideSearchByPostId).toHaveBeenCalledTimes(1);
        expect(selectPostFromRightHandSideSearchByPostId.mock.calls[0][0]).toEqual(latestReplyablePostId);
    });

    it('should match snapshot for read only channel', () => {
        const wrapper = shallowWithIntl(createPost({readOnlyChannel: true}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when cannot post', () => {
        const wrapper = shallowWithIntl(createPost({canPost: false}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when file upload disabled', () => {
        const wrapper = shallowWithIntl(createPost({canUploadFiles: false}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should allow to force send invalid slash command as a message', async () => {
        const error = {
            message: 'No command found',
            server_error_id: 'api.command.execute_command.not_found.app_error',
        };
        const executeCommand = jest.fn(() => Promise.resolve({error}));
        const onSubmitPost = jest.fn();

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    executeCommand,
                    onSubmitPost,
                },
            }),
        );

        wrapper.setState({
            message: '/fakecommand some text',
        });
        expect(wrapper.find('[id="postServerError"]').exists()).toBe(false);

        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(executeCommand).toHaveBeenCalled();
        expect(wrapper.find('[id="postServerError"]').exists()).toBe(true);
        expect(onSubmitPost).not.toHaveBeenCalled();

        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(wrapper.find('[id="postServerError"]').exists()).toBe(false);

        expect(onSubmitPost).toHaveBeenCalledWith(
            expect.objectContaining({
                message: '/fakecommand some text',
            }),
            expect.anything(),
        );
    });

    it('should throw away invalid command error if user resumes typing', async () => {
        const error = {
            message: 'No command found',
            server_error_id: 'api.command.execute_command.not_found.app_error',
        };
        const executeCommand = jest.fn(() => Promise.resolve({error}));
        const onSubmitPost = jest.fn();

        const wrapper = shallowWithIntl(
            createPost({
                actions: {
                    ...actionsProp,
                    executeCommand,
                    onSubmitPost,
                },
            }),
        );

        wrapper.setState({
            message: '/fakecommand some text',
        });
        expect(wrapper.find('[id="postServerError"]').exists()).toBe(false);

        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(executeCommand).toHaveBeenCalled();
        expect(wrapper.find('[id="postServerError"]').exists()).toBe(true);
        expect(onSubmitPost).not.toHaveBeenCalled();

        wrapper.instance().handleChange({
            target: {value: 'some valid text'},
        });
        expect(wrapper.find('[id="postServerError"]').exists()).toBe(false);

        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});

        expect(onSubmitPost).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'some valid text',
            }),
            expect.anything(),
        );
    });

    it('should be able to format a pasted markdown table', () => {
        const wrapper = shallowWithIntl(createPost());
        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                focus: jest.fn(),
            };
        };
        wrapper.instance().textboxRef.current = {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()};

        const event = {
            target: {
                id: 'post_textbox',
            },
            preventDefault: jest.fn(),
            clipboardData: {
                items: [1],
                types: ['text/html'],
                getData: () => {
                    return '<table><tr><td>test</td><td>test</td></tr><tr><td>test</td><td>test</td></tr></table>';
                },
            },
        };

        const markdownTable = '|test | test|\n|--- | ---|\n|test | test|\n';

        wrapper.instance().pasteHandler(event);
        expect(wrapper.state('message')).toBe(markdownTable);
    });

    it('should preserve the original message after pasting a markdown table', () => {
        const wrapper = shallowWithIntl(createPost());

        const message = 'original message';
        wrapper.setState({
            message,
            caretPosition: message.length,
        });

        const event = {
            target: {
                id: 'post_textbox',
            },
            preventDefault: jest.fn(),
            clipboardData: {
                items: [1],
                types: ['text/html'],
                getData: () => {
                    return '<table><tr><td>test</td><td>test</td></tr><tr><td>test</td><td>test</td></tr></table>';
                },
            },
        };

        const markdownTable = '|test | test|\n|--- | ---|\n|test | test|\n\n';
        const expectedMessage = `${message}\n${markdownTable}`;

        const mockTop = () => {
            return document.createElement('div');
        };

        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                getBoundingClientRect: jest.fn(mockTop),
                focus: jest.fn(),
            };
        };

        wrapper.instance().textboxRef.current = {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()};

        wrapper.instance().pasteHandler(event);
        expect(wrapper.state('message')).toBe(expectedMessage);
    });

    it('should be able to format a github codeblock (pasted as a table)', () => {
        const wrapper = shallowWithIntl(createPost());
        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                focus: jest.fn(),
            };
        };
        wrapper.instance().textboxRef.current = {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()};

        const event = {
            target: {
                id: 'post_textbox',
            },
            preventDefault: jest.fn(),
            clipboardData: {
                items: [1],
                types: ['text/plain', 'text/html'],
                getData: (type) => {
                    if (type === 'text/plain') {
                        return '// a javascript codeblock example\nif (1 > 0) {\n  return \'condition is true\';\n}';
                    }
                    return '<table class="highlight tab-size js-file-line-container" data-tab-size="8"><tbody><tr><td id="LC1" class="blob-code blob-code-inner js-file-line"><span class="pl-c"><span class="pl-c">//</span> a javascript codeblock example</span></td></tr><tr><td id="L2" class="blob-num js-line-number" data-line-number="2">&nbsp;</td><td id="LC2" class="blob-code blob-code-inner js-file-line"><span class="pl-k">if</span> (<span class="pl-c1">1</span> <span class="pl-k">&gt;</span> <span class="pl-c1">0</span>) {</td></tr><tr><td id="L3" class="blob-num js-line-number" data-line-number="3">&nbsp;</td><td id="LC3" class="blob-code blob-code-inner js-file-line"><span class="pl-en">console</span>.<span class="pl-c1">log</span>(<span class="pl-s"><span class="pl-pds">\'</span>condition is true<span class="pl-pds">\'</span></span>);</td></tr><tr><td id="L4" class="blob-num js-line-number" data-line-number="4">&nbsp;</td><td id="LC4" class="blob-code blob-code-inner js-file-line">}</td></tr></tbody></table>';
                },
            },
        };

        const codeBlockMarkdown = "```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";

        wrapper.instance().pasteHandler(event);
        expect(wrapper.state('message')).toBe(codeBlockMarkdown);
    });

    it('should be able to format a github codeblock (pasted as a table) with existing draft post', () => {
        const wrapper = shallowWithIntl(createPost());
        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                focus: jest.fn(),
            };
        };
        wrapper.instance().textboxRef.current = {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()};
        wrapper.setState({
            message: 'test',
            caretPosition: 'test'.length, // cursor is at the end
        });

        const event = {
            target: {
                id: 'post_textbox',
            },
            preventDefault: jest.fn(),
            clipboardData: {
                items: [1],
                types: ['text/plain', 'text/html'],
                getData: (type) => {
                    if (type === 'text/plain') {
                        return '// a javascript codeblock example\nif (1 > 0) {\n  return \'condition is true\';\n}';
                    }
                    return '<table class="highlight tab-size js-file-line-container" data-tab-size="8"><tbody><tr><td id="LC1" class="blob-code blob-code-inner js-file-line"><span class="pl-c"><span class="pl-c">//</span> a javascript codeblock example</span></td></tr><tr><td id="L2" class="blob-num js-line-number" data-line-number="2">&nbsp;</td><td id="LC2" class="blob-code blob-code-inner js-file-line"><span class="pl-k">if</span> (<span class="pl-c1">1</span> <span class="pl-k">&gt;</span> <span class="pl-c1">0</span>) {</td></tr><tr><td id="L3" class="blob-num js-line-number" data-line-number="3">&nbsp;</td><td id="LC3" class="blob-code blob-code-inner js-file-line"><span class="pl-en">console</span>.<span class="pl-c1">log</span>(<span class="pl-s"><span class="pl-pds">\'</span>condition is true<span class="pl-pds">\'</span></span>);</td></tr><tr><td id="L4" class="blob-num js-line-number" data-line-number="4">&nbsp;</td><td id="LC4" class="blob-code blob-code-inner js-file-line">}</td></tr></tbody></table>';
                },
            },
        };

        const codeBlockMarkdown = "test\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";

        wrapper.instance().pasteHandler(event);
        expect(wrapper.state('message')).toBe(codeBlockMarkdown);
    });

    it('should not enable the save button when message empty', () => {
        const wrapper = shallowWithIntl(createPost());
        const saveButton = wrapper.find('.post-body__actions a');

        expect(saveButton.hasClass('disabled')).toBe(true);
    });

    it('should enable the save button when message not empty', () => {
        const wrapper = shallowWithIntl(createPost({draft: {...draftProp, message: 'a message'}}));
        const saveButton = wrapper.find('.post-body__actions a');

        expect(saveButton.hasClass('disabled')).toBe(false);
    });

    it('should enable the save button when a file is available for upload', () => {
        const wrapper = shallowWithIntl(createPost({draft: {...draftProp, fileInfos: [{id: '1'}]}}));
        const saveButton = wrapper.find('.post-body__actions a');

        expect(saveButton.hasClass('disabled')).toBe(false);
    });

    testComponentForLineBreak(
        (value) => createPost({draft: {...draftProp, message: value}}),
        (instance) => instance.state().message,
    );

    testComponentForMarkdownHotkeys(
        (value) => createPost({draft: {...draftProp, message: value}}),
        (wrapper, setSelectionRangeFn) => {
            wrapper.instance().textboxRef = {
                current: {
                    getInputBox: jest.fn(() => {
                        return {
                            focus: jest.fn(),
                            setSelectionRange: setSelectionRangeFn,
                        };
                    }),
                },
            };
        },
        (instance) => instance.find(Textbox),
        (instance) => instance.state().message,
    );

    it('should adjust selection to correct text', () => {
        const value = 'Jalebi _Fafda_ and Sambharo';
        const wrapper = shallowWithIntl(createPost({draft: {...draftProp, message: value}}));

        const setSelectionRangeFn = jest.fn();
        wrapper.instance().textboxRef = {
            current: {
                getInputBox: jest.fn(() => {
                    return {
                        focus: jest.fn(),
                        setSelectionRange: setSelectionRangeFn,
                    };
                }),
            },
        };

        const textbox = wrapper.find(Textbox);
        const e = makeSelectionEvent(value, 7, 14);
        textbox.props().onSelect(e);
        expect(setSelectionRangeFn).toHaveBeenCalledWith(8, 13);
    });
});
