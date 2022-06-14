// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getIsAdvancedTextEditorEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {uploadFile} from 'actions/file_actions.jsx';
import {getCurrentLocale} from 'selectors/i18n';
import {canUploadFiles} from 'utils/file_utils';

import FileUpload from './file_upload.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const maxFileSize = parseInt(config.MaxFileSize, 10);
    const isAdvancedTextEditorEnabled = getIsAdvancedTextEditorEnabled(state);

    return {
        maxFileSize,
        canUploadFiles: canUploadFiles(config),
        locale: getCurrentLocale(state),
        isAdvancedTextEditorEnabled,
        pluginFileUploadMethods: state.plugins.components.FileUploadMethod,
        pluginFilesWillUploadHooks: state.plugins.components.FilesWillUploadHook,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            uploadFile,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(FileUpload);
