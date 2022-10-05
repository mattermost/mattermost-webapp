// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';

import {GlobalState} from 'types/store';

import RhsCommentBroadcast from './rhs_comment_broadcast';

type Props = {
    channelId: string;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const channelName = makeGetChannel()(state, {id: ownProps.channelId}).display_name;

    return {
        channelName,
    };
}

export default connect(mapStateToProps)(RhsCommentBroadcast);
