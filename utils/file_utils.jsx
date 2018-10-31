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

export function getFileDimentionsForDisplay(dimentions, {maxHeight, maxWidth}) {
    const {width, height} = dimentions;
    if (height <= maxHeight && width <= maxWidth) {
        return dimentions;
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

export function getOpenGraphMetadataByLink(embedData, url) {
    const og = embedData.find((embed) => embed.type === 'opengraph' && embed.url === url);
    if (og) {
        return og.data;
    }
    return null;
}
