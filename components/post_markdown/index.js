// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getAllUserMentionKeys} from 'mattermost-redux/selectors/entities/search';
import {getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import {canManageMembers} from 'utils/channel_utils.jsx';

import PostMarkdown from './post_markdown';

function mapStateToProps(state, ownProps) {
    const channel = getChannel(state, ownProps.channelId);
    const allMentionKeys = getAllUserMentionKeys(state);
    const mentionKeysWithoutChannelMentions = filterOutChannelMentions(allMentionKeys);
    return {
        channel,
        pluginHooks: state.plugins.components.MessageWillFormat,
        hasPluginTooltips: Boolean(state.plugins.components.LinkTooltip),
        isUserCanManageMembers: channel && canManageMembers(state, channel),
        allMentionKeys,
        mentionKeysWithoutGroups: getCurrentUserMentionKeys(state),
        mentionKeysWithoutChannelMentions,
    };
}

const filterOutChannelMentions = memoizeResult((mentionKeys) => mentionKeys.filter((value) => !['@all', '@channel', '@here'].includes(value.key)));

export default connect(mapStateToProps)(PostMarkdown);
