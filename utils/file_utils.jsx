// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent';

export function canUploadFiles(state) {
    const license = state.entities.general.license;
    const config = state.entities.general.config;

    const isLicensed = license && license.IsLicensed === 'true';
    const compliance = license && license.Compliance === 'true';
    const enableFileAttachments = config.EnableFileAttachments === 'true';
    const enableMobileFileUpload = config.EnableMobileFileUpload === 'true';

    if (!enableFileAttachments) {
        return false;
    }

    if (UserAgent.isMobileApp() && isLicensed && compliance) {
        return enableMobileFileUpload;
    }

    return true;
}

export function canDownloadFiles() {
    if (UserAgent.isMobileApp() && window.mm_license.IsLicensed === 'true' && window.mm_license.Compliance === 'true') {
        return window.mm_config.EnableMobileFileDownload !== 'false';
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
