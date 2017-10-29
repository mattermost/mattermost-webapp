// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {getFilePreviewUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';

import * as FileUtils from 'utils/file_utils';

export default class ImagePreview extends React.PureComponent {
    static propTypes = {

        /**
         * The file info object
         */
        fileInfo: PropTypes.object.isRequired
    };

    render() {
        const {has_preview_image: hasPreviewImage, id} = this.props.fileInfo;
        const fileUrl = getFileUrl(id);
        const previewUrl = hasPreviewImage ? getFilePreviewUrl(id) : fileUrl;

        if (!FileUtils.canDownloadFiles()) {
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
}
