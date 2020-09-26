// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {removeReaction} from 'mattermost-redux/actions/posts';
import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';
import {getCurrentUserId, makeGetProfilesForReactions, getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import Permissions from 'mattermost-redux/constants/permissions';
import Constants from 'mattermost-redux/constants/general';
import {Post} from 'mattermost-redux/types/posts';
import {Reaction} from 'mattermost-redux/types/reactions';
import {ClientConfig} from 'mattermost-redux/types/config';
import {UserProfile} from 'mattermost-redux/types/users';
import {Emoji} from 'mattermost-redux/types/emojis';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';

import {addReaction} from 'actions/post_actions.jsx';

import * as EmojiUtils from 'utils/emoji.jsx';
import {getSortedUsers} from 'utils/utils.jsx';

import ReactionComponent from './reaction';

type Props = {
    post: Post;
    emojiName: string;
    reactions: Reaction[]
}

function makeMapStateToProps() {
    const getProfilesForReactions = makeGetProfilesForReactions();

    return function mapStateToProps(state: GlobalState, ownProps: Props) {
        const config = getConfig(state);
        const license = getLicense(state);
        const me = getCurrentUser(state);

        const profiles = getProfilesForReactions(state, ownProps.reactions);
        let emoji;
        if (EmojiUtils.EmojiIndicesByAlias.has(ownProps.emojiName)) {
            const index = EmojiUtils.EmojiIndicesByAlias.get(ownProps.emojiName);
            if (index) {
                emoji = EmojiUtils.Emojis[index];
            }
        } else {
            const emojis = getCustomEmojisByName(state);
            emoji = emojis.get(ownProps.emojiName);
        }

        let emojiImageUrl = '';
        if (emoji) {
            emojiImageUrl = getEmojiImageUrl(emoji as Emoji);
        }
        const channel = getChannel(state, ownProps.post.channel_id) || {};
        const channelIsArchived = channel.delete_at !== 0;
        const teamId = channel.team_id;
        const currentUserId = getCurrentUserId(state);
        const teammateNameDisplaySetting = getTeammateNameDisplaySetting(state);
        let canAddReaction = false;
        let canRemoveReaction = false;

        if (!channelIsArchived) {
            canAddReaction = checkReactionAction(state, teamId, ownProps.post.channel_id, channel.name, config, license, me, Permissions.REMOVE_REACTION);
            canRemoveReaction = checkReactionAction(state, teamId, ownProps.post.channel_id, channel.name, config, license, me, Permissions.ADD_REACTION);
        }

        return {
            profiles,
            otherUsersCount: ownProps.reactions.length - profiles.length,
            currentUserId,
            reactionCount: ownProps.reactions.length,
            canAddReaction,
            canRemoveReaction,
            emojiImageUrl,
            sortedUsers: getSortedUsers(ownProps.reactions, currentUserId, profiles, teammateNameDisplaySetting),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            addReaction,
            removeReaction,
            getMissingProfilesByIds,
        }, dispatch),
    };
}

function checkReactionAction(
    state: GlobalState,
    teamId: string,
    channelId: string,
    channelName: string,
    config: Partial<ClientConfig>,
    license: any,
    user: UserProfile,
    permission: string) {
    if (!haveIChannelPermission(state, {team: teamId, channel: channelId, permission})) {
        return false;
    }

    if (channelName === Constants.DEFAULT_CHANNEL && config.ExperimentalTownSquareIsReadOnly === 'true' && license.IsLicensed === 'true' && !user.roles.includes('system_admin')) {
        return false;
    }

    return true;
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ReactionComponent);
