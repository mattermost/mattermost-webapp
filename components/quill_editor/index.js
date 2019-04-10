// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {getEmojiMap} from 'selectors/emojis';

import QuillEditor from './quill_editor.jsx';

function mapStateToProps(state) {
    // TODO: Don't need it now, will need it later
    const config = getConfig(state);
    const emojiMap = getEmojiMap(state);

    return {
        config,
        emojiMap,
    };
}

export default connect(mapStateToProps, null, null, {withRef: true})(QuillEditor);
