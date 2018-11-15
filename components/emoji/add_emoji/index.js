// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {createCustomEmoji} from 'mattermost-redux/actions/emojis';

import {getEmojiMap} from 'selectors/emojis';

import AddEmoji from './add_emoji.jsx';

function mapStateToProps(state) {
    return {
        emojiMap: getEmojiMap(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            createCustomEmoji,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddEmoji);
