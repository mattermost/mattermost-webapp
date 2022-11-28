// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {getChannelURL} from 'utils/utils';

import {GlobalState} from 'types/store';

import ChannelDraft from './channel_draft';

type OwnProps = {
    id: string;
}

function makeMapStateToProps() {
    const getChannel = makeGetChannel();

    return (state: GlobalState, ownProps: OwnProps) => {
        const channel = getChannel(state, ownProps);

        const teamId = getCurrentTeamId(state);
        const channelUrl = getChannelURL(state, channel, teamId);

        return {
            channel,
            channelUrl,
        };
    };
}
export default connect(makeMapStateToProps)(ChannelDraft);
