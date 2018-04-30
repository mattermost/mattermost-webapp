// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';

import {getSiteURL} from 'utils/url.jsx';

import PostMarkdown from './post_markdown';

const getChannelNamesMap = createSelector(
    getChannelsNameMapInCurrentTeam,
    (state, props) => props,
    (channelNamesMap, props) => {
        if (props && props.channel_mentions) {
            return Object.assign({}, props.channel_mentions, channelNamesMap);
        }
        return channelNamesMap;
    }
);

function mapStateToProps(state) {
    const config = getConfig(state);

    return {
        channelNamesMap: getChannelNamesMap(state),
        mentionKeys: getCurrentUserMentionKeys(state),
        siteURL: getSiteURL(),
        team: getCurrentTeam(state),
        hasImageProxy: config.HasImageProxy === 'true',
    };
}

export default connect(mapStateToProps)(PostMarkdown);
