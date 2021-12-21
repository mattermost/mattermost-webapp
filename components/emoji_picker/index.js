// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCustomEmojisEnabled} from 'mattermost-redux/selectors/entities/emojis';
import {getCustomEmojis, searchCustomEmojis} from 'mattermost-redux/actions/emojis';

import {incrementEmojiPickerPage, setUserSkinTone} from 'actions/emoji_actions';
import {getEmojiMap, getRecentEmojis, getUserSkinTone} from 'selectors/emojis';

import EmojiPicker from './emoji_picker.jsx';

function mapStateToProps(state) {
    return {
        customEmojisEnabled: getCustomEmojisEnabled(state),
        customEmojiPage: state.views.emoji.emojiPickerCustomPage,
        emojiMap: getEmojiMap(state),
        recentEmojis: getRecentEmojis(state),
        userSkinTone: getUserSkinTone(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getCustomEmojis,
            searchCustomEmojis,
            incrementEmojiPickerPage,
            setUserSkinTone,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiPicker);
