// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store/index.js';

import {Post} from 'mattermost-redux/types/posts.js';

import {FileInfo} from 'mattermost-redux/types/files.js';

import {ActionResult, GenericAction} from 'mattermost-redux/types/actions.js';

import {CommandArgs} from 'mattermost-redux/types/integrations.js';

import {PostDraft} from 'types/store/rhs.js';

import {ModalData} from 'types/actions.js';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {getCurrentChannel, getCurrentChannelStats, getChannelMemberCountsByGroup as selectChannelMemberCountsByGroup} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getChannelTimezones, getChannelMemberCountsByGroup} from 'mattermost-redux/actions/channels';
import {get, getInt, getBool, getPrewrittenMessagesTreatment} from 'mattermost-redux/selectors/entities/preferences';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {
    getCurrentUsersLatestPost,
    getLatestReplyablePostId,
    makeGetMessageInHistoryItem,
} from 'mattermost-redux/selectors/entities/posts';
import {getAssociatedGroupsForReferenceByMention} from 'mattermost-redux/selectors/entities/groups';
import {
    addMessageIntoHistory,
    moveHistoryIndexBack,
    moveHistoryIndexForward,
    removeReaction,
} from 'mattermost-redux/actions/posts';
import {Permissions, Posts, Preferences as PreferencesRedux} from 'mattermost-redux/constants';

import {connectionErrorCount} from 'selectors/views/system';

import {addReaction, createPost, setEditingPost, emitShortcutReactToLastPostFrom} from 'actions/post_actions.jsx';
import {scrollPostListToBottom} from 'actions/views/channel';
import {selectPostFromRightHandSideSearchByPostId} from 'actions/views/rhs';
import {setShowPreviewOnCreatePost} from 'actions/views/textbox';
import {executeCommand} from 'actions/command';
import {runMessageWillBePostedHooks, runSlashCommandWillBePostedHooks} from 'actions/hooks';
import {getPostDraft, getIsRhsExpanded} from 'selectors/rhs';
import {showPreviewOnCreatePost} from 'selectors/views/textbox';
import {getCurrentLocale} from 'selectors/i18n';
import {getEmojiMap, getShortcutReactToLastPostEmittedFrom} from 'selectors/emojis';
import {setGlobalItem, actionOnGlobalItemsWithPrefix} from 'actions/storage';
import {openModal, closeModal} from 'actions/views/modals';
import {Constants, Preferences, StoragePrefixes, TutorialSteps, UserStatuses} from 'utils/constants';
import {canUploadFiles} from 'utils/file_utils';
import {PrewrittenMessagesTreatments} from 'mattermost-redux/constants/config';

import CreatePost from './create_post';

function makeMapStateToProps() {
    const getMessageInHistoryItem = makeGetMessageInHistoryItem(Posts.MESSAGE_TYPES.POST as any);

    return (state: GlobalState) => {
        const config = getConfig(state);
        const license = getLicense(state);
        const currentChannel = getCurrentChannel(state) || {};
        const currentChannelTeammateUsername = getUser(state, currentChannel.teammate_id || '')?.username;
        const draft = getPostDraft(state, StoragePrefixes.DRAFT, currentChannel.id);
        const latestReplyablePostId = getLatestReplyablePostId(state);
        const currentChannelMembersCount = getCurrentChannelStats(state) ? getCurrentChannelStats(state).member_count : 1;
        const tutorialStep = getInt(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED);
        const enableEmojiPicker = config.EnableEmojiPicker === 'true';
        const enableGifPicker = config.EnableGifPicker === 'true';
        const enableConfirmNotificationsToChannel = config.EnableConfirmNotificationsToChannel === 'true';
        const currentUserId = getCurrentUserId(state);
        const userIsOutOfOffice = getStatusForUserId(state, currentUserId) === UserStatuses.OUT_OF_OFFICE;
        const badConnection = connectionErrorCount(state) > 1;
        const isTimezoneEnabled = config.ExperimentalTimezone === 'true';
        const shortcutReactToLastPostEmittedFrom = getShortcutReactToLastPostEmittedFrom(state);
        const canPost = haveICurrentChannelPermission(state, Permissions.CREATE_POST);
        const useChannelMentions = haveICurrentChannelPermission(state, Permissions.USE_CHANNEL_MENTIONS);
        const isLDAPEnabled = license?.IsLicensed === 'true' && license?.LDAPGroups === 'true';
        const useGroupMentions = isLDAPEnabled && haveICurrentChannelPermission(state, Permissions.USE_GROUP_MENTIONS);
        const channelMemberCountsByGroup = selectChannelMemberCountsByGroup(state, currentChannel.id);
        const currentTeamId = getCurrentTeamId(state);
        const groupsWithAllowReference = useGroupMentions ? getAssociatedGroupsForReferenceByMention(state, currentTeamId, currentChannel.id) : null;
        const prewrittenMessages = getPrewrittenMessagesTreatment(state);
        const enableTutorial = config.EnableTutorial === 'true';
        const showTutorialTip = enableTutorial && tutorialStep === TutorialSteps.POST_POPOVER && prewrittenMessages !== PrewrittenMessagesTreatments.AROUND_INPUT;

        return {
            currentTeamId,
            currentChannel,
            currentChannelTeammateUsername,
            currentChannelMembersCount,
            currentUserId,
            codeBlockOnCtrlEnter: getBool(state, PreferencesRedux.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true),
            ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
            fullWidthTextBox: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
            showTutorialTip,
            messageInHistoryItem: getMessageInHistoryItem(state),
            draft,
            latestReplyablePostId,
            locale: getCurrentLocale(state),
            currentUsersLatestPost: getCurrentUsersLatestPost(state, ''),
            canUploadFiles: canUploadFiles(config),
            enableEmojiPicker,
            enableGifPicker,
            enableConfirmNotificationsToChannel,
            maxPostSize: parseInt(config.MaxPostSize || '', 10) || Constants.DEFAULT_CHARACTER_LIMIT,
            userIsOutOfOffice,
            rhsExpanded: getIsRhsExpanded(state),
            emojiMap: getEmojiMap(state),
            badConnection,
            isTimezoneEnabled,
            shortcutReactToLastPostEmittedFrom,
            canPost,
            useChannelMentions,
            shouldShowPreview: showPreviewOnCreatePost(state),
            groupsWithAllowReference,
            useGroupMentions,
            channelMemberCountsByGroup,
            isLDAPEnabled,
            prewrittenMessages,
            tutorialStep,
        };
    };
}

function onSubmitPost(post: Post, fileInfos: FileInfo[]) {
    return (dispatch: Dispatch<GenericAction>) => {
        dispatch(createPost(post, fileInfos) as any);
    };
}

type Actions = {
    setShowPreview: (showPreview: boolean) => void;
    addMessageIntoHistory: (message: string) => void;
    moveHistoryIndexBack: (index: string) => Promise<void>;
    moveHistoryIndexForward: (index: string) => Promise<void>;
    addReaction: (postId: string, emojiName: string) => void;
    onSubmitPost: (post: Post, fileInfos: FileInfo[]) => void;
    removeReaction: (postId: string, emojiName: string) => void;
    clearDraftUploads: () => void;
    runMessageWillBePostedHooks: (originalPost: Post) => ActionResult;
    runSlashCommandWillBePostedHooks: (originalMessage: string, originalArgs: CommandArgs) => ActionResult;
    setDraft: (name: string, value: PostDraft | null) => void;
    setEditingPost: (postId?: string, refocusId?: string, title?: string, isRHS?: boolean) => void;
    selectPostFromRightHandSideSearchByPostId: (postId: string) => void;
    openModal: (modalData: ModalData) => void;
    closeModal: (modalId: string) => void;
    executeCommand: (message: string, args: CommandArgs) => ActionResult;
    getChannelTimezones: (channelId: string) => ActionResult;
    scrollPostListToBottom: () => void;
    emitShortcutReactToLastPostFrom: (emittedFrom: string) => void;
    getChannelMemberCountsByGroup: (channelId: string, includeTimezones: boolean) => void;
    savePreferences: (userId: string, preferences: PreferenceType[]) => ActionResult;
}

// Temporarily store draft manually in localStorage since the current version of redux-persist
// we're on will not save the draft quickly enough on page unload.
function setDraft(key: string, value: PostDraft) {
    if (value) {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        localStorage.removeItem(key);
    }
    return setGlobalItem(key, value);
}

function clearDraftUploads() {
    return actionOnGlobalItemsWithPrefix(StoragePrefixes.DRAFT, (_key: string, draft: PostDraft) => {
        if (!draft || draft.uploadsInProgress.length === 0) {
            return draft;
        }

        return {...draft, uploadsInProgress: []};
    });
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, Actions>({
            addMessageIntoHistory,
            onSubmitPost,
            moveHistoryIndexBack,
            moveHistoryIndexForward,
            addReaction,
            removeReaction,
            setDraft,
            clearDraftUploads,
            selectPostFromRightHandSideSearchByPostId,
            setEditingPost,
            emitShortcutReactToLastPostFrom,
            openModal,
            closeModal,
            executeCommand,
            getChannelTimezones,
            runMessageWillBePostedHooks,
            runSlashCommandWillBePostedHooks,
            scrollPostListToBottom,
            setShowPreview: setShowPreviewOnCreatePost,
            getChannelMemberCountsByGroup,
            savePreferences,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(CreatePost);
