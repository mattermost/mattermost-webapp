// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {getFileThumbnailUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';

import FilenameOverlay from 'components/file_attachment/filename_overlay.jsx';

import Constants from 'utils/constants.jsx';
import * as FileUtils from 'utils/file_utils';
import * as Utils from 'utils/utils.jsx';

export default class FileAttachment extends React.PureComponent {
    static propTypes = {

        /*
         * File detailed information
         */
        fileInfo: PropTypes.object.isRequired,

        /*
         * The index of this attachment preview in the parent FileAttachmentList
         */
        index: PropTypes.number.isRequired,

        /*
         * Handler for when the thumbnail is clicked passed the index above
         */
        handleImageClick: PropTypes.func,

        /*
         * Display in compact format
         */
        compactDisplay: PropTypes.bool
    };

    constructor(props) {
        super(props);

        this.state = {
            loaded: Utils.getFileType(props.fileInfo.extension) !== 'image'
        };
    }

    componentDidMount() {
        this.loadFiles();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.fileInfo.id !== this.props.fileInfo.id) {
            const extension = nextProps.fileInfo.extension;

            this.setState({
                loaded: Utils.getFileType(extension) !== 'image' && extension !== 'svg'
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.state.loaded && this.props.fileInfo.id !== prevProps.fileInfo.id) {
            this.loadFiles();
        }
    }

    loadFiles = () => {
        const fileInfo = this.props.fileInfo;
        const fileType = Utils.getFileType(fileInfo.extension);

        if (fileType === 'image') {
            const thumbnailUrl = getFileThumbnailUrl(fileInfo.id);

            Utils.loadImage(thumbnailUrl, this.handleImageLoaded);
        } else if (fileInfo.extension === 'svg') {
            Utils.loadImage(getFileUrl(fileInfo.id), this.handleImageLoaded);
        }
    }

    handleImageLoaded = () => {
        this.setState({
            loaded: true
        });
    }

    onAttachmentClick = (e) => {
        e.preventDefault();
        this.props.handleImageClick(this.props.index);
    }

    render() {
        const fileInfo = this.props.fileInfo;
        const fileName = fileInfo.name;
        const fileUrl = getFileUrl(fileInfo.id);

        let thumbnail;
        if (this.state.loaded) {
            const type = Utils.getFileType(fileInfo.extension);

            if (type === 'image') {
                let className = 'post-image';

                if (fileInfo.width < Constants.THUMBNAIL_WIDTH && fileInfo.height < Constants.THUMBNAIL_HEIGHT) {
                    className += ' small';
                } else {
                    className += ' normal';
                }

                let thumbnailUrl = getFileThumbnailUrl(fileInfo.id);
                if (Utils.isGIFImage(fileInfo.extension) && !fileInfo.has_preview_image) {
                    thumbnailUrl = getFileUrl(fileInfo.id);
                }

                thumbnail = (
                    <div
                        className={className}
                        style={{
                            backgroundImage: `url(${thumbnailUrl})`,
                            backgroundSize: 'cover'
                        }}
                    />
                );
            } else if (fileInfo.extension === 'svg') {
                thumbnail = (
                    <img
                        className='post-image normal'
                        src={getFileUrl(fileInfo.id)}
                    />
                );
            } else {
                thumbnail = <div className={'file-icon ' + Utils.getIconClassName(type)}/>;
            }
        } else {
            thumbnail = <div className='post-image__load'/>;
        }

        const canDownloadFiles = FileUtils.canDownloadFiles();

        let downloadButton = null;
        if (canDownloadFiles) {
            downloadButton = (
                <a
                    href={fileUrl}
                    download={fileName}
                    className='post-image__download'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <span className='fa fa-download'/>
                </a>
            );
        }

        return (
            <div className='post-image__column'>
                <a
                    className='post-image__thumbnail'
                    href='#'
                    onClick={this.onAttachmentClick}
                >
                    {thumbnail}
                </a>
                <div className='post-image__details'>
                    <FilenameOverlay
                        fileInfo={this.props.fileInfo}
                        index={this.props.index}
                        handleImageClick={this.props.handleImageClick}
                        compactDisplay={this.props.compactDisplay}
                        canDownload={canDownloadFiles}
                    />
                    <div>
                        {downloadButton}
                        <span className='post-image__type'>{fileInfo.extension.toUpperCase()}</span>
                        <span className='post-image__size'>{Utils.fileSizeToString(fileInfo.size)}</span>
                    </div>
                </div>
            </div>
        );
    }
}
