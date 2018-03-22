// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {uploadFile} from 'actions/file_actions.jsx';
import {canUploadFiles} from 'utils/file_utils';

import FileUpload from './file_upload.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const maxFileSize = parseInt(config.MaxFileSize, 10);

    return {
        currentChannelId: getCurrentChannelId(state),
        uploadFile,
        maxFileSize,
        canUploadFiles: canUploadFiles(config),
    };
}

export default connect(mapStateToProps, null, null, {withRef: true})(FileUpload);
