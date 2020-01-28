// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

export default function ImagePreview({fileInfo, canDownloadFiles}) {
    let fileUrl;
    let previewUrl;
    if (fileInfo.id) {
        fileUrl = getFileDownloadUrl(fileInfo.id);
        previewUrl = fileInfo.has_preview_image ? getFilePreviewUrl(fileInfo.id) : fileUrl;
    } else {
        fileUrl = fileInfo.link;
        previewUrl = fileInfo.link;
    }

    if (!canDownloadFiles) {
        return <img src={previewUrl}/>;
    }

    return (
        <a
            href={fileUrl}
            target='_blank'
            rel='noopener noreferrer'
            download={Boolean(fileInfo.id)}
        >
            <img
                data-testid='imagePreview'
                alt={'preview url image'}
                src={previewUrl}
            />
        </a>
    );
}

ImagePreview.propTypes = {
    fileInfo: PropTypes.object.isRequired,
    canDownloadFiles: PropTypes.bool.isRequired,
};
