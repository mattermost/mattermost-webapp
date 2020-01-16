// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

export default function ImagePreview({fileInfo, canDownloadFiles}) {
    const {has_preview_image: hasPreviewImage, id, link} = fileInfo;
    const fileUrl = link || getFileDownloadUrl(id);
    const previewUrl = hasPreviewImage ? getFilePreviewUrl(id) : fileUrl;

    if (!canDownloadFiles) {
        return <img src={previewUrl}/>;
    }

    return (
        <a
            href={fileUrl}
            target='_blank'
            rel='noopener noreferrer'
            download={true}
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
