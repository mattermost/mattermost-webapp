// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import ChannelDraft from './channel_draft';

function mapStateToProps(state, ownProps) {
    const channel = getChannel(state, ownProps.id);

    return {
        channel,
    };
}
export default connect(mapStateToProps)(ChannelDraft);
