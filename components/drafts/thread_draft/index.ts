// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getThreadOrSynthetic} from 'mattermost-redux/selectors/entities/threads';

import {PostDraft} from 'types/store/rhs';
import {GlobalState} from 'types/store';

import ThreadDraft from './thread_draft';

type OwnProps = {
    id: string;
    value: PostDraft;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const channel = getChannel(state, ownProps.value.channel_id);
    const post = getPost(state, ownProps.id);

    let thread;
    if (post) {
        thread = getThreadOrSynthetic(state, post);
    }

    return {
        channel,
        thread,
    };
}
export default connect(mapStateToProps)(ThreadDraft);
