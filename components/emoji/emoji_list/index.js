// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCustomEmojiIdsSortedByName} from 'mattermost-redux/selectors/entities/emojis';

import {getCustomEmojis, searchCustomEmojis} from 'mattermost-redux/actions/emojis';

import EmojiList from './emoji_list.jsx';

const mapStateToProps = (state) => ({
    emojiIds: getCustomEmojiIdsSortedByName(state) || []
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getCustomEmojis,
        searchCustomEmojis
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(EmojiList);
