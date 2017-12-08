// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {Preferences} from 'mattermost-redux/constants';

import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getTheme, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getCurrentUserMentionKeys, getUsersByUsername} from 'mattermost-redux/selectors/entities/users';

import {getEmojiMap} from 'selectors/emojis';

import {getSiteURL} from 'utils/url.jsx';

import PostMessageView from './post_message_view.jsx';

const getChannelNamesMap = createSelector(
    (state) => getChannelsNameMapInCurrentTeam(state),
    (state, props) => props,
    (channelNamesMap, props) => {
        if (props && props.channel_mentions) {
            return Object.assign({}, props.channel_mentions, channelNamesMap);
        }
        return channelNamesMap;
    }
);

function mapStateToProps(state, ownProps) {
    const user = getCurrentUser(state);

    const channelNamesMap = getChannelNamesMap(state, ownProps.post.props);

    return {
        ...ownProps,
        emojis: getEmojiMap(state),
        enableFormatting: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'formatting', true),
        mentionKeys: getCurrentUserMentionKeys(state),
        usernameMap: getUsersByUsername(state),
        team: getCurrentTeam(state),
        siteUrl: getSiteURL(),
        theme: getTheme(state),
        pluginPostTypes: state.plugins.postTypes,
        currentUser: user,
        channelNamesMap
    };
}

export default connect(mapStateToProps)(PostMessageView);
