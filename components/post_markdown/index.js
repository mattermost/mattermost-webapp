// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {createSelector} from 'reselect';
import {connect} from 'react-redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getAllUserMentionKeys} from 'mattermost-redux/selectors/entities/search';
import {getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';

import {canManageMembers} from 'utils/channel_utils.jsx';

import PostMarkdown from './post_markdown';

export function makeGetMentionKeysForPost() {
    return createSelector(
        getAllUserMentionKeys,
        getCurrentUserMentionKeys,
        (state, post) => post,
        (allMentionKeys, mentionKeysWithoutGroups, post) => {
            let mentionKeys = allMentionKeys;
            if (post?.props?.disable_group_highlight) { // eslint-disable-line camelcase
                mentionKeys = mentionKeysWithoutGroups;
            }

            if (post?.props?.mentionHighlightDisabled) {
                mentionKeys = mentionKeys.filter((value) => !['@all', '@channel', '@here'].includes(value.key));
            }

            return mentionKeys;
        }
    );
}

function mapStateToProps(state, ownProps) {
    const channel = getChannel(state, ownProps.channelId);
    const getMentionKeysForPost = makeGetMentionKeysForPost();
    return {
        channel,
        pluginHooks: state.plugins.components.MessageWillFormat,
        hasPluginTooltips: Boolean(state.plugins.components.LinkTooltip),
        isUserCanManageMembers: channel && canManageMembers(state, channel),
        mentionKeys: getMentionKeysForPost(state, ownProps.post),
    };
}

export default connect(mapStateToProps)(PostMarkdown);
