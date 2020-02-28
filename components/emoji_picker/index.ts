// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import {getCustomEmojis, searchCustomEmojis} from 'mattermost-redux/actions/emojis';

import {incrementEmojiPickerPage} from 'actions/emoji_actions';
import {getEmojiMap, getRecentEmojis} from 'selectors/emojis';

import EmojiPicker from './emoji_picker';

interface State extends GlobalState {
    views: {
        emoji: {
            emojiPickerCustomPage: number;
        };
    };
}

function mapStateToProps(state: State) {
    return {
        customEmojisEnabled: state.entities.general.config.EnableCustomEmoji === 'true',
        customEmojiPage: state.views.emoji.emojiPickerCustomPage,
        emojiMap: getEmojiMap(state),
        recentEmojis: getRecentEmojis(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getCustomEmojis,
            searchCustomEmojis,
            incrementEmojiPickerPage,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiPicker);
