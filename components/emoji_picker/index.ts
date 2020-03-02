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
    // TODO: codegen for system emojis
    // and inject generated system emojis

    // const systemEmojiRows = [
    //   'section1:',
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9],
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9],
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9],
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9],
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9],
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9],
    //   [1, 2, 3                  ],
    //   'section2:',
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9],
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9],
    //   [1, 2, 3, 4, 5, 6, 7, 8, 9],
    //   [1, 2, 3, 4,              ],
    // ]

    // -> ReactWindow.FixedSizeList

    const emojiMap = getEmojiMap(state);
    const recentEmojiNames = getRecentEmojis(state) as string[];
    const recentEmojis = recentEmojiNames.map((name) => emojiMap.get(name));
    return {
        emojiMap,
        recentEmojis,

        // customEmojisEnabled: state.entities.general.config.EnableCustomEmoji === 'true',
        // customEmojiPage: state.views.emoji.emojiPickerCustomPage,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({

            // getCustomEmojis,
            searchCustomEmojis,

            // incrementEmojiPickerPage,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiPicker);
