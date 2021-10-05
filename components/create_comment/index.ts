// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store/index.js';

import {PostDraft} from 'types/store/rhs.js';

import {ModalData} from 'types/actions.js';

import {ActionFunc, ActionResult, DispatchFunc} from 'mattermost-redux/types/actions.js';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getAllChannelStats, getChannelMemberCountsByGroup as selectChannelMemberCountsByGroup} from 'mattermost-redux/selectors/entities/channels';
import {makeGetMessageInHistoryItem} from 'mattermost-redux/selectors/entities/posts';
import {resetCreatePostRequest, resetHistoryIndex} from 'mattermost-redux/actions/posts';
import {getChannelTimezones, getChannelMemberCountsByGroup} from 'mattermost-redux/actions/channels';
import {Permissions, Preferences, Posts} from 'mattermost-redux/constants';
import {getAssociatedGroupsForReferenceByMention} from 'mattermost-redux/selectors/entities/groups';

import {connectionErrorCount} from 'selectors/views/system';

import {Constants, StoragePrefixes} from 'utils/constants';
import {getCurrentLocale} from 'selectors/i18n';

import {
    clearCommentDraftUploads,
    updateCommentDraft,
    makeOnMoveHistoryIndex,
    makeOnSubmit,
    makeOnEditLatestPost,
} from 'actions/views/create_comment';
import {emitShortcutReactToLastPostFrom} from 'actions/post_actions';
import {getPostDraft, getIsRhsExpanded, getSelectedPostFocussedAt} from 'selectors/rhs';
import {showPreviewOnCreateComment} from 'selectors/views/textbox';
import {setShowPreviewOnCreateComment} from 'actions/views/textbox';
import {openModal, closeModal} from 'actions/views/modals';

import CreateComment from './create_comment';

type OwnProps = {
    rootId: string;
    channelId: string;
    latestPostId: string;
}

function makeMapStateToProps() {
    const getMessageInHistoryItem = makeGetMessageInHistoryItem(Posts.MESSAGE_TYPES.COMMENT as 'comment');

    return (state: GlobalState, ownProps: OwnProps) => {
        const err = state.requests.posts.createPost.error || {};

        const draft = getPostDraft(state, StoragePrefixes.COMMENT_DRAFT, ownProps.rootId);

        const channelMembersCount = getAllChannelStats(state)[ownProps.channelId] ? getAllChannelStats(state)[ownProps.channelId].member_count : 1;
        const messageInHistory = getMessageInHistoryItem(state);

        const channel = state.entities.channels.channels[ownProps.channelId] || {};

        const config = getConfig(state);
        const license = getLicense(state);
        const enableConfirmNotificationsToChannel = config.EnableConfirmNotificationsToChannel === 'true';
        const enableEmojiPicker = config.EnableEmojiPicker === 'true';
        const enableGifPicker = config.EnableGifPicker === 'true';
        const badConnection = connectionErrorCount(state) > 1;
        const isTimezoneEnabled = config.ExperimentalTimezone === 'true';
        const canPost = haveIChannelPermission(state, channel.team_id, channel.id, Permissions.CREATE_POST);
        const useChannelMentions = haveIChannelPermission(state, channel.team_id, channel.id, Permissions.USE_CHANNEL_MENTIONS);
        const isLDAPEnabled = license?.IsLicensed === 'true' && license?.LDAPGroups === 'true';
        const useGroupMentions = isLDAPEnabled && haveIChannelPermission(state, channel.team_id, channel.id, Permissions.USE_GROUP_MENTIONS);
        const channelMemberCountsByGroup = selectChannelMemberCountsByGroup(state, ownProps.channelId);
        const groupsWithAllowReference = useGroupMentions ? getAssociatedGroupsForReferenceByMention(state, channel.team_id, channel.id) : null;

        return {
            draft,
            messageInHistory,
            channelMembersCount,
            codeBlockOnCtrlEnter: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true),
            ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
            createPostErrorId: err.server_error_id,
            enableConfirmNotificationsToChannel,
            enableEmojiPicker,
            enableGifPicker,
            locale: getCurrentLocale(state),
            maxPostSize: parseInt(config.MaxPostSize || '', 10) || Constants.DEFAULT_CHARACTER_LIMIT,
            rhsExpanded: getIsRhsExpanded(state),
            badConnection,
            isTimezoneEnabled,
            selectedPostFocussedAt: getSelectedPostFocussedAt(state),
            canPost,
            useChannelMentions,
            shouldShowPreview: showPreviewOnCreateComment(state),
            groupsWithAllowReference,
            useGroupMentions,
            channelMemberCountsByGroup,
        };
    };
}

function makeOnUpdateCommentDraft(rootId: string) {
    return (draft?: PostDraft) => updateCommentDraft(rootId, draft);
}

type Actions = {
    clearCommentDraftUploads: () => void;
    onUpdateCommentDraft: (draft?: PostDraft) => void;
    updateCommentDraftWithRootId: (rootID: string, draft: PostDraft) => void;
    onSubmit: (draft: PostDraft, options: {ignoreSlash: boolean}) => void;
    onResetHistoryIndex: () => void;
    onMoveHistoryIndexBack: () => void;
    onMoveHistoryIndexForward: () => void;
    onEditLatestPost: () => ActionResult;
    resetCreatePostRequest: () => void;
    getChannelTimezones: (channelId: string) => Promise<ActionResult>;
    emitShortcutReactToLastPostFrom: (location: string) => void;
    setShowPreview: (showPreview: boolean) => void;
    getChannelMemberCountsByGroup: (channelID: string) => void;
    openModal: (modalData: ModalData) => void;
    closeModal: (modalId: string) => void;
}

function makeMapDispatchToProps() {
    let onUpdateCommentDraft: (draft?: PostDraft) => void;
    let onSubmit: (draft: PostDraft, options: {ignoreSlash: boolean}) => (dispatch: DispatchFunc, getState: () => GlobalState) => Promise<ActionResult | ActionResult[]> | ActionResult;
    let onMoveHistoryIndexBack: () => (dispatch: DispatchFunc, getState: () => GlobalState) => Promise<ActionResult | ActionResult[]> | ActionResult;
    let onMoveHistoryIndexForward: () => (dispatch: DispatchFunc, getState: () => GlobalState) => Promise<ActionResult | ActionResult[]> | ActionResult;
    let onEditLatestPost: () => ActionFunc;

    function onResetHistoryIndex() {
        return resetHistoryIndex(Posts.MESSAGE_TYPES.COMMENT);
    }

    let rootId: string;
    let channelId: string;
    let latestPostId: string;

    return (dispatch: Dispatch, ownProps: OwnProps) => {
        if (rootId !== ownProps.rootId) {
            onUpdateCommentDraft = makeOnUpdateCommentDraft(ownProps.rootId);
            onMoveHistoryIndexBack = makeOnMoveHistoryIndex(ownProps.rootId, -1);
            onMoveHistoryIndexForward = makeOnMoveHistoryIndex(ownProps.rootId, 1);
        }

        if (rootId !== ownProps.rootId) {
            onEditLatestPost = makeOnEditLatestPost(ownProps.rootId);
        }

        if (rootId !== ownProps.rootId || channelId !== ownProps.channelId || latestPostId !== ownProps.latestPostId) {
            onSubmit = makeOnSubmit(ownProps.channelId, ownProps.rootId, ownProps.latestPostId);
        }

        rootId = ownProps.rootId;
        channelId = ownProps.channelId;
        latestPostId = ownProps.latestPostId;

        return bindActionCreators<ActionCreatorsMapObject<any>, Actions>({
            clearCommentDraftUploads,
            onUpdateCommentDraft,
            updateCommentDraftWithRootId: updateCommentDraft,
            onSubmit,
            onResetHistoryIndex,
            onMoveHistoryIndexBack,
            onMoveHistoryIndexForward,
            onEditLatestPost,
            resetCreatePostRequest,
            getChannelTimezones,
            emitShortcutReactToLastPostFrom,
            setShowPreview: setShowPreviewOnCreateComment,
            getChannelMemberCountsByGroup,
            openModal,
            closeModal,
        }, dispatch);
    };
}

export default connect(makeMapStateToProps, makeMapDispatchToProps, null, {forwardRef: true})(CreateComment);
