// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCustomEmojiIdsSortedByName} from 'mattermost-redux/selectors/entities/emojis';
import {GenericAction} from 'mattermost-redux/types/actions';
import {getCustomEmojis, searchCustomEmojis} from 'mattermost-redux/actions/emojis';

import {GlobalState} from 'mattermost-redux/types/store';

import EmojiList from './emoji_list.jsx';

function mapStateToProps(state: GlobalState) {
    return {
        emojiIds: getCustomEmojiIdsSortedByName(state) || [],
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getCustomEmojis,
            searchCustomEmojis,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiList);
