// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {uploadFile} from 'actions/file_actions.jsx';
import {canUploadFiles} from 'utils/file_utils';

import FileUpload from './file_upload.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const maxFileSize = parseInt(config.MaxFileSize, 10);

    return {
        ...ownProps,
        currentChannelId: getCurrentChannelId(state),
        uploadFile,
        maxFileSize,
        canUploadFiles: canUploadFiles(state)
    };
}

export default connect(mapStateToProps)(FileUpload);
