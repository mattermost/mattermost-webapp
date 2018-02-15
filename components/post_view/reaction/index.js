// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {addReaction, removeReaction} from 'mattermost-redux/actions/posts';
import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';
import {getCurrentUserId, makeGetProfilesForReactions} from 'mattermost-redux/selectors/entities/users';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import * as Emoji from 'utils/emoji.jsx';

import Reaction from './reaction.jsx';

const makeMapStateToProps = () => {
    const getProfilesForReactions = makeGetProfilesForReactions();

    return (state, ownProps) => {
        const profiles = getProfilesForReactions(state, ownProps.reactions);
        let emoji;
        if (Emoji.EmojiIndicesByAlias.has(ownProps.emojiName)) {
            emoji = Emoji.Emojis[Emoji.EmojiIndicesByAlias.get(ownProps.emojiName)];
        } else {
            emoji = ownProps.emojis.get(ownProps.emojiName);
        }

        let emojiImageUrl = '';
        if (emoji) {
            emojiImageUrl = getEmojiImageUrl(emoji);
        }

        return {
            profiles,
            otherUsersCount: ownProps.reactions.length - profiles.length,
            currentUserId: getCurrentUserId(state),
            reactionCount: ownProps.reactions.length,
            emojiImageUrl
        };
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        addReaction,
        removeReaction,
        getMissingProfilesByIds
    }, dispatch)
});

export default connect(makeMapStateToProps, mapDispatchToProps)(Reaction);
