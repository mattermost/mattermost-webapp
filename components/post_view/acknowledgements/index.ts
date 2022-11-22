// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getHasReactions, getPostAcknowledgementsWithProfiles} from 'mattermost-redux/selectors/entities/posts';

import {GlobalState} from 'types/store';

import {Post} from '@mattermost/types/posts';

import PostAcknowledgements from './post_acknowledgements';

type OwnProps = {
    postId: Post['id'];
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const currentUserId = getCurrentUserId(state);
    const hasReactions = getHasReactions(state, ownProps.postId);
    const list = getPostAcknowledgementsWithProfiles(state, ownProps.postId);

    let acknowledgedAt = 0;
    if (list && list.length) {
        const ack = list.find((ack) => ack.user.id === currentUserId);
        if (ack) {
            acknowledgedAt = ack.acknowledgedAt;
        }
    }

    return {
        acknowledgedAt,
        list,
        hasReactions,
    };
}

export default connect(mapStateToProps)(PostAcknowledgements);
