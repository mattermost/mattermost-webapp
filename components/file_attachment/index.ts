// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import {GlobalState} from 'types/store';

import {FileDropdownPluginComponent} from 'types/store/plugins';
import {canDownloadFiles} from 'utils/file_utils';

import FileAttachment from './file_attachment';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const getPluginMenuItems = memoizeResult((state: GlobalState) => state.plugins.components.FilesDropdown || []);
    const pluginMenuItems = getPluginMenuItems(state) as unknown as FileDropdownPluginComponent[];

    return {
        canDownloadFiles: canDownloadFiles(config),
        enableSVGs: config.EnableSVGs === 'true',
        enablePublicLink: config.EnablePublicLink === 'true',
        pluginMenuItems,
    };
}

export default connect(mapStateToProps)(FileAttachment);
