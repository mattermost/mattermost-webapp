// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getEmojiMap} from 'selectors/emojis';

import AddEmoji from './add_emoji.jsx';

function mapStateToProps(state) {
    return {
        emojiMap: getEmojiMap(state),
    };
}

export default connect(mapStateToProps)(AddEmoji);
