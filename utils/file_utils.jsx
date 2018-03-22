// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent';

export function canUploadFiles(config) {
    const enableFileAttachments = config.EnableFileAttachments === 'true';
    const enableMobileFileUpload = config.EnableMobileFileUpload === 'true';

    if (!enableFileAttachments) {
        return false;
    }

    if (UserAgent.isMobileApp()) {
        return enableMobileFileUpload;
    }

    return true;
}

export function canDownloadFiles(config) {
    if (UserAgent.isMobileApp()) {
        return config.EnableMobileFileDownload === 'true';
    }

    return true;
}

export function trimFilename(filename) {
    let trimmedFilename = filename;
    if (filename.length > Constants.MAX_FILENAME_LENGTH) {
        trimmedFilename = filename.substring(0, Math.min(Constants.MAX_FILENAME_LENGTH, filename.length)) + '...';
    }

    return trimmedFilename;
}
