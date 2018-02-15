// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
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

const mapStateToProps = (state) => ({
    channelNamesMap: getChannelNamesMap(state),
    mentionKeys: getCurrentUserMentionKeys(state),
    siteURL: getSiteURL(),
    team: getCurrentTeam(state)
});

export default connect(mapStateToProps)(PostMarkdown);
