// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import YoutubeVideo from './youtube_video.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const googleDeveloperKey = config.GoogleDeveloperKey;

    return {
        currentChannelId: getCurrentChannelId(state),
        googleDeveloperKey,
    };
}

export default connect(mapStateToProps)(YoutubeVideo);
