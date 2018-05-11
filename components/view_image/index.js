// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {canDownloadFiles} from 'utils/file_utils.jsx';

import ViewImage from './view_image.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    return {
        canDownloadFiles: canDownloadFiles(config),
        enablePublicLink: config.EnablePublicLink === 'true',
    };
}

export default connect(mapStateToProps)(ViewImage);
