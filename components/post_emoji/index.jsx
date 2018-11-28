// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getEmojiMap} from 'selectors/emojis';

import PostEmoji from './post_emoji.jsx';

function mapStateToProps(state, ownProps) {
    const emojiName = ownProps.name;
    const emojiMap = getEmojiMap(state);
    const emoji = emojiMap.get(emojiName);

    let imageUrl = '';
    let displayTextOnly = false;
    if (state.entities.emojis.nonExistentEmoji.has(emojiName)) {
        displayTextOnly = true;
    } else if (emoji) {
        imageUrl = getEmojiImageUrl(emoji);
    } else if (getConfig(state).EnableCustomEmoji !== 'true' || getCurrentUserId(state) === '') {
        displayTextOnly = false;
    } else {
        displayTextOnly = true;
    }

    return {
        imageUrl,
        displayTextOnly,
    };
}

export default connect(mapStateToProps)(PostEmoji);
