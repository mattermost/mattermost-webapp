// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';
import {FileInfo} from 'mattermost-redux/types/files';

type Props = {
    fileInfo: FileInfo;
    canDownloadFiles: boolean;
}

export default function ImagePreview(props: Props): JSX.Element {
    const fileInfo = props?.fileInfo;
    const isExternalFile = !fileInfo.id;

    let fileUrl;
    let previewUrl;
    if (isExternalFile) {
        fileUrl = fileInfo.link;
        previewUrl = fileInfo.link;
    } else {
        fileUrl = getFileDownloadUrl(fileInfo.id);
        previewUrl = fileInfo.has_preview_image ? getFilePreviewUrl(fileInfo.id) : fileUrl;
    }

    if (!props.canDownloadFiles) {
        return <img src={previewUrl}/>;
    }

    return (
        <a
            href={fileUrl}
            target='_blank'
            rel='noopener noreferrer'
            download={!isExternalFile}
        >
            <img
                data-testid='imagePreview'
                alt={'preview url image'}
                src={previewUrl}
            />
        </a>
    );
}
