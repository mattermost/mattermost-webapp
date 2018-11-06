// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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

export function getFileTypeFromMime(extension) {
    const extentionSplitBySlash = extension.split('/');
    const extentionPrefix = extentionSplitBySlash[0];
    const extentionSuffix = extentionSplitBySlash[1];
    if (extentionPrefix === 'video') {
        return 'video';
    } else if (extentionPrefix === 'audio') {
        return 'audio';
    } else if (extentionPrefix === 'image') {
        return 'image';
    } else if (extentionSuffix === 'pdf') {
        return 'pdf';
    } else if (extentionSuffix.includes('vnd.ms-excel') || extentionSuffix.includes('spreadsheetml') || extentionSuffix.includes('vnd.sun.xml.calc') || extentionSuffix.includes('opendocument.spreadsheet')) {
        return 'spreadsheet';
    } else if (extentionSuffix.includes('vnd.ms-powerpoint') || extentionSuffix.includes('presentationml') || extentionSuffix.includes('vnd.sun.xml.impress') || extentionSuffix.includes('opendocument.presentation')) {
        return 'presentation';
    } else if ((extentionSuffix === 'msword') || extentionSuffix.includes('vnd.ms-word') || extentionSuffix.includes('officedocument.wordprocessingml') || extentionSuffix.includes('application/x-mswrite')) {
        return 'word';
    }

    return 'other';
}
