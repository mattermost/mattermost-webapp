// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'types/store';

import {getSelectedPostId} from 'selectors/rhs';
import {getPostEditHistory} from 'selectors/posts';

import PostEditHistory from './post_edit_history';

function mapStateToProps(state: GlobalState) {
    const selectedPostId = getSelectedPostId(state) || '';

    return {
        channelDisplayName: getCurrentChannel(state).display_name,
        originalPost: getPost(state, selectedPostId),
        postEditHistory: getPostEditHistory(state),
    };
}

const connector = connect(mapStateToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(PostEditHistory);
