// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {removePost} from 'mattermost-redux/actions/posts';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {makeGetCommentCountForPost} from 'mattermost-redux/selectors/entities/posts';
import {get, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {Post} from 'mattermost-redux/types/posts';

import {GlobalState} from 'types/store';

import {emitShortcutReactToLastPostFrom} from 'actions/post_actions.jsx';
import {Preferences} from 'utils/constants';
import {shouldShowDotMenu} from 'utils/post_utils';
import {getSelectedPostCard} from 'selectors/rhs';
import {getShortcutReactToLastPostEmittedFrom, getOneClickReactionEmojis} from 'selectors/emojis';

import PostInfo from './post_info';

type OwnProps = {
    post: Post;
}

function makeMapStateToProps() {
    const getReplyCount = makeGetCommentCountForPost();

    return (state: GlobalState, ownProps: OwnProps) => {
        const selectedCard = getSelectedPostCard(state);
        const config = getConfig(state);
        const channel = state.entities.channels.channels[ownProps.post.channel_id];
        const channelIsArchived = channel ? channel.delete_at !== 0 : null;
        const enableEmojiPicker = config.EnableEmojiPicker === 'true' && !channelIsArchived;
        const teamId = getCurrentTeamId(state);
        const shortcutReactToLastPostEmittedFrom = getShortcutReactToLastPostEmittedFrom(state);

        let emojis = [];
        const oneClickReactionsEnabled = get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.ONE_CLICK_REACTIONS_ENABLED, Preferences.ONE_CLICK_REACTIONS_ENABLED_DEFAULT) === 'true';
        if (oneClickReactionsEnabled) {
            emojis = getOneClickReactionEmojis(state);
        }

        return {
            teamId,
            isFlagged: get(state, Preferences.CATEGORY_FLAGGED_POST, ownProps.post.id, null) != null,
            isMobile: state.views.channel.mobileView,
            isCardOpen: selectedCard && selectedCard.id === ownProps.post.id,
            enableEmojiPicker,
            isReadOnly: channelIsArchived,
            shouldShowDotMenu: shouldShowDotMenu(state, ownProps.post, channel),
            shortcutReactToLastPostEmittedFrom,
            collapsedThreadsEnabled: isCollapsedThreadsEnabled(state),
            hasReplies: getReplyCount(state, ownProps.post) > 0,
            oneClickReactionsEnabled,
            recentEmojis: emojis,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
    return {
        actions: bindActionCreators({
            removePost,
            emitShortcutReactToLastPostFrom,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostInfo);
