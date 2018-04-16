// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {canDownloadFiles} from 'utils/file_utils.jsx';

import FileAttachment from './file_attachment.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    return {
        canDownloadFiles: canDownloadFiles(config),
    };
}

export default connect(mapStateToProps)(FileAttachment);
