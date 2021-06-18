// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCustomEmojis, searchCustomEmojis} from 'mattermost-redux/actions/emojis';

import {incrementEmojiPickerPage, setRecentSkin} from 'actions/emoji_actions';
import {persistRecentSkin} from 'actions/local_storage';
import {getEmojiMap, getRecentEmojis, getRecentSkin} from 'selectors/emojis';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import EmojiPicker from './emoji_picker.jsx';

function mapStateToProps(state) {
    const currentTeam = getCurrentTeam(state);
    return {
        customEmojisEnabled: state.entities.general.config.EnableCustomEmoji === 'true',
        customEmojiPage: state.views.emoji.emojiPickerCustomPage,
        emojiMap: getEmojiMap(state),
        recentEmojis: getRecentEmojis(state),
        recentSkin: getRecentSkin(state),
        currentTeamName: currentTeam.name,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getCustomEmojis,
            searchCustomEmojis,
            incrementEmojiPickerPage,
            setRecentSkin,
            persistRecentSkin,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiPicker);
