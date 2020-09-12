// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
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

import CreateComment from './create_comment.jsx';

function makeMapStateToProps() {
    const getMessageInHistoryItem = makeGetMessageInHistoryItem(Posts.MESSAGE_TYPES.COMMENT);

    return (state, ownProps) => {
        const err = state.requests.posts.createPost.error || {};

        const draft = getPostDraft(state, StoragePrefixes.COMMENT_DRAFT, ownProps.rootId);
        const enableAddButton = draft.message.trim().length !== 0 || draft.fileInfos.length !== 0;

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
        const canPost = haveIChannelPermission(
            state,
            {
                channel: channel.id,
                team: channel.team_id,
                permission: Permissions.CREATE_POST,
            },
        );
        const useChannelMentions = haveIChannelPermission(state, {
            channel: channel.id,
            team: channel.team_id,
            permission: Permissions.USE_CHANNEL_MENTIONS,
        });
        const isLDAPEnabled = license?.IsLicensed === 'true' && license?.LDAPGroups === 'true';
        const useGroupMentions = isLDAPEnabled && haveIChannelPermission(state, {
            channel: channel.id,
            team: channel.team_id,
            permission: Permissions.USE_GROUP_MENTIONS,
        });
        const channelMemberCountsByGroup = selectChannelMemberCountsByGroup(state, ownProps.channelId);
        const groupsWithAllowReference = useGroupMentions ? getAssociatedGroupsForReferenceByMention(state, channel.team_id, channel.id) : null;

        return {
            draft,
            messageInHistory,
            enableAddButton,
            channelMembersCount,
            codeBlockOnCtrlEnter: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true),
            ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
            createPostErrorId: err.server_error_id,
            readOnlyChannel: !isCurrentUserSystemAdmin(state) && config.ExperimentalTownSquareIsReadOnly === 'true' && channel.name === Constants.DEFAULT_CHANNEL,
            enableConfirmNotificationsToChannel,
            enableEmojiPicker,
            enableGifPicker,
            locale: getCurrentLocale(state),
            maxPostSize: parseInt(config.MaxPostSize, 10) || Constants.DEFAULT_CHARACTER_LIMIT,
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

function makeOnUpdateCommentDraft(rootId) {
    return (draft) => updateCommentDraft(rootId, draft);
}

function makeMapDispatchToProps() {
    let onUpdateCommentDraft;
    let onSubmit;
    let onMoveHistoryIndexBack;
    let onMoveHistoryIndexForward;
    let onEditLatestPost;

    function onResetHistoryIndex() {
        return resetHistoryIndex(Posts.MESSAGE_TYPES.COMMENT);
    }

    let rootId;
    let channelId;
    let latestPostId;

    return (dispatch, ownProps) => {
        if (rootId !== ownProps.rootId) {
            onUpdateCommentDraft = makeOnUpdateCommentDraft(ownProps.rootId);
            onMoveHistoryIndexBack = makeOnMoveHistoryIndex(ownProps.rootId, -1);
            onMoveHistoryIndexForward = makeOnMoveHistoryIndex(ownProps.rootId, 1);
        }

        if (rootId !== ownProps.rootId || channelId !== ownProps.channelId) {
            onEditLatestPost = makeOnEditLatestPost(ownProps.channelId, ownProps.rootId);
        }

        if (rootId !== ownProps.rootId || channelId !== ownProps.channelId || latestPostId !== ownProps.latestPostId) {
            onSubmit = makeOnSubmit(ownProps.channelId, ownProps.rootId, ownProps.latestPostId);
        }

        rootId = ownProps.rootId;
        channelId = ownProps.channelId;
        latestPostId = ownProps.latestPostId;

        return bindActionCreators({
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
        }, dispatch);
    };
}

export default connect(makeMapStateToProps, makeMapDispatchToProps, null, {forwardRef: true})(CreateComment);
