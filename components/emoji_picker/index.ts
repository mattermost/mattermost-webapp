// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {getCustomEmojisEnabled} from 'mattermost-redux/selectors/entities/emojis';
import {getCustomEmojis, searchCustomEmojis} from 'mattermost-redux/actions/emojis';

import {GlobalState} from 'types/store';

import {incrementEmojiPickerPage, setUserSkinTone} from 'actions/emoji_actions';
import {getEmojiMap, getRecentEmojis, getUserSkinTone} from 'selectors/emojis';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import EmojiPicker from './emoji_picker';

function mapStateToProps(state: GlobalState) {
    return {
        customEmojisEnabled: getCustomEmojisEnabled(state),
        customEmojiPage: state.views.emoji.emojiPickerCustomPage,
        emojiMap: getEmojiMap(state),
        recentEmojis: getRecentEmojis(state),
        userSkinTone: getUserSkinTone(state),
        currentTeamName: getCurrentTeam(state)?.name ?? '',
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getCustomEmojis,
            searchCustomEmojis,
            incrementEmojiPickerPage,
            setUserSkinTone,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(EmojiPicker);
