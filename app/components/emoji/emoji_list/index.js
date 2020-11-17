// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCustomEmojiIdsSortedByName} from 'mattermost-redux/selectors/entities/emojis';

import {getCustomEmojis, searchCustomEmojis} from 'mattermost-redux/actions/emojis';

import EmojiList from './emoji_list.jsx';

function mapStateToProps(state) {
    return {
        emojiIds: getCustomEmojiIdsSortedByName(state) || [],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getCustomEmojis,
            searchCustomEmojis,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiList);
