// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';

import BroadcastThreadReply from './crt_broadcast_thread_reply';

type OwnProps = {
    channelId: string;
}

function makeMapStateToProps() {
    const getChannel = makeGetChannel();

    return function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
        const channelName = getChannel(state, {id: ownProps.channelId}).display_name;

        return {
            channelName,
        };
    };
}

export default connect(makeMapStateToProps)(BroadcastThreadReply);
