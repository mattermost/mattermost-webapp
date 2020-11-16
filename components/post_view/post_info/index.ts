// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';
import {removePost} from 'mattermost-redux/actions/posts';
import {isCurrentChannelReadOnly} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {Post} from 'mattermost-redux/types/posts';

import {GlobalState} from 'types/store';

import {emitShortcutReactToLastPostFrom} from 'actions/post_actions.jsx';
import {Preferences} from 'utils/constants';
import * as PostUtils from 'utils/post_utils.jsx';
import {getSelectedPostCard} from 'selectors/rhs';
import {getShortcutReactToLastPostEmittedFrom} from 'selectors/emojis';

import PostInfo from './post_info';

type OwnProps = {
    post: Post;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const selectedCard = getSelectedPostCard(state);
    const config = getConfig(state);
    const channel = state.entities.channels.channels[ownProps.post.channel_id];
    const channelIsArchived = channel ? channel.delete_at !== 0 : null;
    const enableEmojiPicker = config.EnableEmojiPicker === 'true' && !channelIsArchived;
    const teamId = getCurrentTeamId(state);
    const shortcutReactToLastPostEmittedFrom = getShortcutReactToLastPostEmittedFrom(state);

    return {
        teamId,
        isFlagged: get(state, Preferences.CATEGORY_FLAGGED_POST, ownProps.post.id, null) != null,
        isMobile: state.views.channel.mobileView,
        isCardOpen: selectedCard && selectedCard.id === ownProps.post.id,
        enableEmojiPicker,
        isReadOnly: isCurrentChannelReadOnly(state) || channelIsArchived,
        shouldShowDotMenu: PostUtils.shouldShowDotMenu(state, ownProps.post, channel),
        shortcutReactToLastPostEmittedFrom,
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

export default connect(mapStateToProps, mapDispatchToProps)(PostInfo);
