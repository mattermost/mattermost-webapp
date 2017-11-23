// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {getFilePreviewUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';

import * as Utils from 'utils/utils';
import * as FileUtils from 'utils/file_utils';

import LoadingImagePreview from 'components/loading_image_preview';

export default class SingleImageView extends React.PureComponent {
    static propTypes = {

        /**
         * FileInfo to view
         **/
        fileInfo: PropTypes.object.isRequired
    };

    static defaultProps = {
        fileInfo: {}
    };

    constructor(props) {
        super(props);

        this.state = {
            imageHeight: '100%',
            loaded: false,
            progress: true
        };
    }

    componentDidMount() {
        this.loadImage();
    }

    loadImage() {
        const {fileInfo} = this.props;
        const fileType = Utils.getFileType(fileInfo.extension);

        if (fileType === 'image') {
            let previewUrl;
            if (fileInfo.has_image_preview) {
                previewUrl = getFilePreviewUrl(fileInfo.id);
            } else {
                // some images (eg animated gifs) just show the file itself and not a preview
                previewUrl = getFileUrl(fileInfo.id);
            }

            Utils.loadImage(
                previewUrl,
                () => this.handleImageLoaded(),
                (completedPercentage) => this.handleImageProgress(completedPercentage)
            );
        } else {
            // there's nothing to load for non-image files
            this.handleImageLoaded();
        }
    }

    handleImageLoaded = () => {
        this.setState({loaded: true});
    }

    handleImageProgress = (completedPercentage) => {
        this.setState({progress: completedPercentage});
    }

    render() {
        const {fileInfo} = this.props;
        const fileUrl = getFileUrl(fileInfo.id);

        const {has_preview_image: hasPreviewImage, id} = fileInfo;
        const previewUrl = hasPreviewImage ? getFilePreviewUrl(id) : fileUrl;

        const canDownloadFiles = FileUtils.canDownloadFiles();
        let downloadButton = null;
        if (canDownloadFiles) {
            downloadButton = (
                <a
                    href={fileUrl}
                    download={fileInfo.fileName}
                    className='download'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <span className='fa fa-download'/>
                </a>
            );
        }

        let content;
        if (this.state.loaded) {
            const fileType = Utils.getFileType(fileInfo.extension);

            if (fileType === 'image' || fileType === 'svg') {
                content = <img src={previewUrl}/>;
            }
        } else {
            // display a progress indicator when the preview for an image is still loading
            const loading = Utils.localizeMessage('view_image.loading', 'Loading');
            const progress = Math.floor(this.state.progress);

            content = (
                <LoadingImagePreview
                    loading={loading}
                    progress={progress}
                />
            );
        }

        return (
            <div className={'single-file-view'}>
                <div className='view__details'>
                    <span className='name'>
                        {fileInfo.name.toUpperCase()}
                    </span>
                    <span className='detail'>
                        {`${fileInfo.extension.toUpperCase()}  ${Utils.fileSizeToString(fileInfo.size)}`}
                    </span>
                </div>
                <div className='view__image'>
                    {content}
                    {downloadButton}
                </div>
            </div>
        );
    }
}
