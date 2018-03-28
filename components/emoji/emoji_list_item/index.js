// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getUser, getCurrentUserId, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {deleteCustomEmoji} from 'mattermost-redux/actions/emojis';

import {getDisplayNameByUser} from 'utils/utils.jsx';

import EmojiListItem from './emoji_list_item.jsx';

function mapStateToProps(state, ownProps) {
    const emoji = state.entities.emojis.customEmoji[ownProps.emojiId];
    const creator = getUser(state, emoji.creator_id) || {};

    return {
        emoji,
        creatorDisplayName: getDisplayNameByUser(creator),
        creatorUsername: creator.username,
        currentUserId: getCurrentUserId(state),
        isSystemAdmin: isCurrentUserSystemAdmin(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            deleteCustomEmoji,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiListItem);
