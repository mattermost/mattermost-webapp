// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {getFilePreviewUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';

import {canDownloadFiles} from 'utils/file_utils';

export default function ImagePreview({fileInfo}) {
    const {has_preview_image: hasPreviewImage, id, link} = fileInfo;
    const fileUrl = link || getFileUrl(id);
    const previewUrl = hasPreviewImage ? getFilePreviewUrl(id) : fileUrl;

    if (!canDownloadFiles()) {
        return <img src={previewUrl}/>;
    }

    return (
        <a
            href={fileUrl}
            target='_blank'
            rel='noopener noreferrer'
            download={true}
        >
            <img src={previewUrl}/>
        </a>
    );
}

ImagePreview.propTypes = {

    /**
     * The file info object
     */
    fileInfo: PropTypes.object.isRequired
};
