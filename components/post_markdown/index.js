// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {createSelector} from 'reselect';
import {connect} from 'react-redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getMyGroupMentionKeysForChannel, getMyGroupMentionKeys} from 'mattermost-redux/selectors/entities/groups';
import {getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';

import {canManageMembers} from 'utils/channel_utils.jsx';

import PostMarkdown from './post_markdown';

export function makeGetMentionKeysForPost() {
    return createSelector(
        getCurrentUserMentionKeys,
        (state, post) => post,
        (state, post, channel) => (channel ? getMyGroupMentionKeysForChannel(state, channel.team_id, channel.id) : getMyGroupMentionKeys(state)),
        (mentionKeysWithoutGroups, post, groupMentionKeys) => {
            let mentionKeys = mentionKeysWithoutGroups;
            if (!post?.props?.disable_group_highlight) { // eslint-disable-line camelcase
                mentionKeys = mentionKeys.concat(groupMentionKeys);
            }

            if (post?.props?.mentionHighlightDisabled) {
                mentionKeys = mentionKeys.filter((value) => !['@all', '@channel', '@here'].includes(value.key));
            }

            return mentionKeys;
        },
    );
}

function makeMapStateToProps() {
    const getMentionKeysForPost = makeGetMentionKeysForPost();

    return (state, ownProps) => {
        const channel = getChannel(state, ownProps.channelId);
        return {
            channel,
            pluginHooks: state.plugins.components.MessageWillFormat,
            hasPluginTooltips: Boolean(state.plugins.components.LinkTooltip),
            isUserCanManageMembers: channel && canManageMembers(state, channel),
            mentionKeys: getMentionKeysForPost(state, ownProps.post, channel),
        };
    };
}

export default connect(makeMapStateToProps)(PostMarkdown);
