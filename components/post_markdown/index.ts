// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {createSelector} from 'reselect';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {
    getMyGroupMentionKeysForChannel,
    getMyGroupMentionKeys,
} from 'mattermost-redux/selectors/entities/groups';
import {getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';
import {Post} from 'mattermost-redux/types/posts';
import {Channel} from 'mattermost-redux/types/channels';

import {GlobalState} from 'types/store';

import {canManageMembers} from 'utils/channel_utils.jsx';

import {MentionKey} from 'utils/text_formatting';

import PostMarkdown from './post_markdown';

export function makeGetMentionKeysForPost(): (
    state: GlobalState,
    post?: Post,
    channel?: Channel
) => MentionKey[] {
    return createSelector(
        'makeGetMentionKeysForPost',
        getCurrentUserMentionKeys,
        (state: GlobalState, post?: Post) => post,
        (state: GlobalState, post?: Post, channel?: Channel) =>
            (channel ? getMyGroupMentionKeysForChannel(state, channel.team_id, channel.id) : getMyGroupMentionKeys(state)),
        (mentionKeysWithoutGroups, post, groupMentionKeys) => {
            let mentionKeys = mentionKeysWithoutGroups;
            if (!post?.props?.disable_group_highlight) {
                // eslint-disable-line camelcase
                mentionKeys = mentionKeys.concat(groupMentionKeys);
            }

            if (post?.props?.mentionHighlightDisabled) {
                mentionKeys = mentionKeys.filter(
                    (value) => !['@all', '@channel', '@here'].includes(value.key),
                );
            }

            return mentionKeys;
        },
    );
}

type OwnProps = {
    channelId: string;
    mentionKeys: MentionKey[];
    post?: Post;
};

function makeMapStateToProps() {
    const getMentionKeysForPost = makeGetMentionKeysForPost();

    return (state: GlobalState, ownProps: OwnProps) => {
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
