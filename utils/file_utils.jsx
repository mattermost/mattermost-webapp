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

export function getFileDimensionsForDisplay(dimensions, {maxHeight, maxWidth}) {
    if (!dimensions) {
        return null;
    }

    const {width, height} = dimensions;
    if (height <= maxHeight && width <= maxWidth) {
        return dimensions;
    }
    const widthRatio = width / maxWidth;
    const heightRatio = height / maxHeight;
    if (heightRatio > widthRatio) {
        return {
            height: maxHeight,
            width: width * (1 / heightRatio),
        };
    }

    return {
        height: height * (1 / widthRatio),
        width: maxWidth,
    };
}

export function getFileTypeFromMime(mimetype) {
    const mimeTypeSplitBySlash = mimetype.split('/');
    const mimeTypePrefix = mimeTypeSplitBySlash[0];
    const mimeTypeSuffix = mimeTypeSplitBySlash[1];

    if (mimeTypePrefix === 'video') {
        return 'video';
    } else if (mimeTypePrefix === 'audio') {
        return 'audio';
    } else if (mimeTypePrefix === 'image') {
        return 'image';
    }

    if (mimeTypeSuffix) {
        if (mimeTypeSuffix === 'pdf') {
            return 'pdf';
        } else if (mimeTypeSuffix.includes('vnd.ms-excel') || mimeTypeSuffix.includes('spreadsheetml') || mimeTypeSuffix.includes('vnd.sun.xml.calc') || mimeTypeSuffix.includes('opendocument.spreadsheet')) {
            return 'spreadsheet';
        } else if (mimeTypeSuffix.includes('vnd.ms-powerpoint') || mimeTypeSuffix.includes('presentationml') || mimeTypeSuffix.includes('vnd.sun.xml.impress') || mimeTypeSuffix.includes('opendocument.presentation')) {
            return 'presentation';
        } else if ((mimeTypeSuffix === 'msword') || mimeTypeSuffix.includes('vnd.ms-word') || mimeTypeSuffix.includes('officedocument.wordprocessingml') || mimeTypeSuffix.includes('application/x-mswrite')) {
            return 'word';
        }
    }

    return 'other';
}
