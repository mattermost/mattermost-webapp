// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getEmojiMap} from 'selectors/emojis';
import {GlobalState} from 'types/store';

import Emoji from './emoji';

function mapStateToProps(state: GlobalState) {
    const emojiMap = getEmojiMap(state);
    return {
        emojiMap,
    };
}

export default connect(mapStateToProps)(Emoji);
