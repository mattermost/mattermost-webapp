// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {Preferences} from 'mattermost-redux/constants';
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getTheme, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getCurrentUserMentionKeys, getUsersByUsername} from 'mattermost-redux/selectors/entities/users';

import {EmojiMap} from 'stores/emoji_store.jsx';

import {getSiteURL} from 'utils/url.jsx';

import PostMessageView from './post_message_view.jsx';

function makeMapStateToProps() {
    let emojiMap;
    let oldCustomEmoji;

    return function mapStateToProps(state, ownProps) {
        const newCustomEmoji = getCustomEmojisByName(state);
        if (newCustomEmoji !== oldCustomEmoji) {
            emojiMap = new EmojiMap(newCustomEmoji);
        }
        oldCustomEmoji = newCustomEmoji;

        const user = getCurrentUser(state);

        return {
            ...ownProps,
            emojis: emojiMap,
            enableFormatting: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'formatting', true),
            mentionKeys: getCurrentUserMentionKeys(state),
            usernameMap: getUsersByUsername(state),
            team: getCurrentTeam(state),
            siteUrl: getSiteURL(),
            theme: getTheme(state),
            pluginPostTypes: state.plugins.postTypes,
            currentUser: user
        };
    };
}

export default connect(makeMapStateToProps)(PostMessageView);
