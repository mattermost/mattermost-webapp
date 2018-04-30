// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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
