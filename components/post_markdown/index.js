// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import PostMarkdown from './post_markdown';

function mapStateToProps(state, ownProps) {
    return {
        channel: getChannel(state, ownProps.channelId),
        pluginHooks: state.plugins.components.MessageWillFormat,
        hasPluginTooltips: Boolean(state.plugins.components.LinkTooltip),
    };
}

export default connect(mapStateToProps)(PostMarkdown);
