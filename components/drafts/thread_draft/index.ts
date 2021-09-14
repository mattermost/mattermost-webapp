// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getThreadOrSynthetic} from 'mattermost-redux/selectors/entities/threads';

import ThreadDraft from './thread_draft';

function mapStateToProps(state, ownProps) {
    const post = getPost(state, ownProps.id);

    let thread;
    let channel;

    if (post) {
        thread = getThreadOrSynthetic(state, post);
        channel = getChannel(state, post.channel_id);
    }

    return {
        channel,
        thread,
    };
}
export default connect(mapStateToProps)(ThreadDraft);
