// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {GlobalState} from 'types/store';

import {PostAcknowledgement} from '@mattermost/types/posts';

import PostAcknowledgements from './post_acknowledgements';

type OwnProps = {
    list: PostAcknowledgement[];
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const currentUserId = getCurrentUserId(state);
    const list = ownProps.list;

    let hasAcknowledged = false;
    if (list && list.length) {
        hasAcknowledged = list.some((ack) => ack.user_id === currentUserId);
    }

    return {
        hasAcknowledged,
    };
}

export default connect(mapStateToProps)(PostAcknowledgements);
