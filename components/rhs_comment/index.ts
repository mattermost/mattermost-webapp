// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {showActionsDropdownPulsatingDot} from 'selectors/actions_menu';
import {setActionsMenuInitialisationState} from 'mattermost-redux/actions/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {
    get,
    isCollapsedThreadsEnabled,
} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {GenericAction} from 'mattermost-redux/types/actions';
import {Emoji} from '@mattermost/types/emojis';
import {Post} from '@mattermost/types/posts';

import {markPostAsUnread, emitShortcutReactToLastPostFrom} from 'actions/post_actions';

import {getShortcutReactToLastPostEmittedFrom, getOneClickReactionEmojis} from 'selectors/emojis';
import {getIsPostBeingEditedInRHS, isEmbedVisible} from 'selectors/posts';
import {getHighlightedPostId} from 'selectors/rhs';
import {getIsMobileView} from 'selectors/views/browser';

import {GlobalState} from 'types/store';

import {isArchivedChannel} from 'utils/channel_utils';
import {areConsecutivePostsBySameUser, shouldShowActionsMenu} from 'utils/post_utils';
import {Preferences} from 'utils/constants';

import RhsComment from './rhs_comment';

interface OwnProps {
    post: Post;
    previousPostId: string;
    teamId: string;
}

function isConsecutivePost(state: GlobalState, ownProps: OwnProps) {
    const post = ownProps.post;
    const previousPost = ownProps.previousPostId && getPost(state, ownProps.previousPostId);

    let consecutivePost = false;

    if (previousPost) {
        consecutivePost = areConsecutivePostsBySameUser(post, previousPost);
    }
    return consecutivePost;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);
    const enableEmojiPicker = config.EnableEmojiPicker === 'true';
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const teamId = ownProps.teamId || getCurrentTeamId(state);
    const channel = state.entities.channels.channels[ownProps.post.channel_id];
    const shortcutReactToLastPostEmittedFrom = getShortcutReactToLastPostEmittedFrom(state);

    const user = getUser(state, ownProps.post.user_id);
    const isBot = Boolean(user && user.is_bot);
    const highlightedPostId = getHighlightedPostId(state);
    const showActionsMenuPulsatingDot = showActionsDropdownPulsatingDot(state);

    let emojis: Emoji[] = [];
    const oneClickReactionsEnabled = get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.ONE_CLICK_REACTIONS_ENABLED, Preferences.ONE_CLICK_REACTIONS_ENABLED_DEFAULT) === 'true';
    if (oneClickReactionsEnabled) {
        emojis = getOneClickReactionEmojis(state);
    }

    return {
        enableEmojiPicker,
        enablePostUsernameOverride,
        isEmbedVisible: isEmbedVisible(state, ownProps.post.id),
        isReadOnly: false,
        teamId,
        pluginPostTypes: state.plugins.postTypes,
        channelIsArchived: isArchivedChannel(channel),
        isConsecutivePost: isConsecutivePost(state, ownProps),
        isFlagged: get(state, Preferences.CATEGORY_FLAGGED_POST, ownProps.post.id, null) != null,
        compactDisplay: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
        colorizeUsernames: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLORIZE_USERNAMES, Preferences.COLORIZE_USERNAMES_DEFAULT) === 'true',
        shouldShowActionsMenu: shouldShowActionsMenu(state, ownProps.post),
        showActionsMenuPulsatingDot,
        shortcutReactToLastPostEmittedFrom,
        isBot,
        collapsedThreadsEnabled: isCollapsedThreadsEnabled(state),
        shouldHighlight: highlightedPostId === ownProps.post.id,
        oneClickReactionsEnabled,
        recentEmojis: emojis,
        isExpanded: state.views.rhs.isSidebarExpanded,

        isPostBeingEdited: getIsPostBeingEditedInRHS(state, ownProps.post.id),
        isMobileView: getIsMobileView(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            markPostAsUnread,
            emitShortcutReactToLastPostFrom,
            setActionsMenuInitialisationState,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RhsComment);
