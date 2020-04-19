// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import {canManageMembers} from 'utils/channel_utils.jsx';

import PostMarkdown from './post_markdown';

function mapStateToProps(state, ownProps) {
    const channel = getChannel(state, ownProps.channelId);
    return {
        channel,
        pluginHooks: state.plugins.components.MessageWillFormat,
        hasPluginTooltips: Boolean(state.plugins.components.LinkTooltip),
        isUserCanManageMembers: channel && canManageMembers(state, channel),
    };
}

export default connect(mapStateToProps)(PostMarkdown);
