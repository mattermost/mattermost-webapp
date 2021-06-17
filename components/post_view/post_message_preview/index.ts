// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';
import PostMessagePreview from './post_message_preview';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {PostPreviewMetadata} from 'mattermost-redux/types/posts';

type Props = {
    metadata: PostPreviewMetadata;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    let user = null;
    if (ownProps.metadata.user_id) {
        user = getUser(state, ownProps.metadata.user_id);
    }

    return {
        user,
    };
}

export default connect(mapStateToProps, null)(PostMessagePreview);