// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {uploadFile} from 'actions/file_actions.jsx';

import FileUpload from './file_upload.jsx';

function mapStateToProps(state) {
    return {
        currentChannelId: getCurrentChannelId(state),
        uploadFile
    };
}

export default connect(mapStateToProps)(FileUpload);
