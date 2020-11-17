// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCustomEmojis, searchCustomEmojis} from 'mattermost-redux/actions/emojis';

import {incrementEmojiPickerPage} from 'actions/emoji_actions.jsx';
import {getEmojiMap, getRecentEmojis} from 'selectors/emojis';

import EmojiPicker from './emoji_picker.jsx';

function mapStateToProps(state) {
    return {
        customEmojisEnabled: state.entities.general.config.EnableCustomEmoji === 'true',
        customEmojiPage: state.views.emoji.emojiPickerCustomPage,
        emojiMap: getEmojiMap(state),
        recentEmojis: getRecentEmojis(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getCustomEmojis,
            searchCustomEmojis,
            incrementEmojiPickerPage,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiPicker);
