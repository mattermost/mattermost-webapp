// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {getFilePreviewUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';

import {
    fileSizeToString,
    getFileType,
    loadImage,
    localizeMessage
} from 'utils/utils';
import {canDownloadFiles} from 'utils/file_utils';

import DownloadIcon from 'components/svg/download_icon';
import LoadingImagePreview from 'components/loading_image_preview';
import ViewImageModal from 'components/view_image.jsx';

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
            loaded: false,
            progress: 0,
            showPreviewModal: false
        };
    }

    componentDidMount() {
        this.loadImage();
    }

    loadImage = () => {
        const {fileInfo} = this.props;
        const fileType = getFileType(fileInfo.extension);

        if (fileType === 'image') {
            let previewUrl;
            if (fileInfo.has_image_preview) {
                previewUrl = getFilePreviewUrl(fileInfo.id);
            } else {
                // some images (eg animated gifs) just show the file itself and not a preview
                previewUrl = getFileUrl(fileInfo.id);
            }

            loadImage(
                previewUrl,
                this.handleImageLoaded,
                this.handleImageProgress
            );
        } else {
            // there's nothing to load for non-image files
            this.handleImageLoaded();
        }
    }

    handleImageLoaded = () => {
        this.setState({loaded: true});
    }

    handleImageProgress = (progress) => {
        this.setState({progress});
    }

    handleImageClick = (e) => {
        e.preventDefault();
        this.setState({showPreviewModal: true});
    }

    showPreviewModal = () => {
        this.setState({showPreviewModal: false});
    }

    render() {
        let content = null;
        let loadingClass = '';
        if (this.state.loaded) {
            const {fileInfo} = this.props;
            const fileUrl = getFileUrl(fileInfo.id);
            const {has_preview_image: hasPreviewImage, id} = fileInfo;
            const previewUrl = hasPreviewImage ? getFilePreviewUrl(id) : fileUrl;

            const canDownload = canDownloadFiles();
            let downloadButton = null;
            if (canDownload) {
                downloadButton = (
                    <a
                        href={fileUrl}
                        download={fileInfo.name}
                        className='file__download'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <DownloadIcon/>
                    </a>
                );
            }

            const fileType = getFileType(fileInfo.extension);
            let svgClass;
            if (fileType === 'svg') {
                svgClass = 'post-image normal';
            }

            content = (
                <div>
                    <div className='file-details'>
                        <span
                            className='file-details__name'
                            onClick={this.handleImageClick}
                        >
                            {fileInfo.name.toUpperCase()}
                        </span>
                        <span className='file-details__extension'>
                            {`${fileInfo.extension.toUpperCase()}  ${fileSizeToString(fileInfo.size)}`}
                        </span>
                    </div>
                    <div className='file__image'>
                        <img
                            src={previewUrl}
                            style={{cursor: 'pointer'}}
                            className={svgClass}
                            onClick={this.handleImageClick}
                        />
                        {downloadButton}
                    </div>
                    <ViewImageModal
                        show={this.state.showPreviewModal}
                        onModalDismissed={this.showPreviewModal}
                        fileInfos={[fileInfo]}
                    />
                </div>
            );
        } else {
            loadingClass = 'loading';

            // display a progress indicator when the preview for an image is still loading
            const loading = localizeMessage('view_image.loading', 'Loading');
            const progress = Math.floor(this.state.progress);

            content = (
                <LoadingImagePreview
                    loading={loading}
                    progress={progress}
                    containerClass={'file__image-loading'}
                />
            );
        }

        return (
            <div className={`${'file-view--single'} ${loadingClass}`}>
                {content}
            </div>
        );
    }
}
