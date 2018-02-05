// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {getFileThumbnailUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';

import {FileTypes} from 'utils/constants.jsx';
import {
    canDownloadFiles,
    trimFilename
} from 'utils/file_utils';
import {
    fileSizeToString,
    getFileType,
    loadImage
} from 'utils/utils.jsx';

import FilenameOverlay from 'components/file_attachment/filename_overlay.jsx';
import FileThumbnail from 'components/file_attachment/file_thumbnail.jsx';
import DownloadIcon from 'components/svg/download_icon';

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
            loaded: getFileType(props.fileInfo.extension) !== FileTypes.IMAGE
        };
    }

    componentDidMount() {
        this.loadFiles();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.fileInfo.id !== this.props.fileInfo.id) {
            const extension = nextProps.fileInfo.extension;

            this.setState({
                loaded: getFileType(extension) !== FileTypes.IMAGE && extension !== FileTypes.SVG
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
        const fileType = getFileType(fileInfo.extension);

        if (fileType === FileTypes.IMAGE) {
            const thumbnailUrl = getFileThumbnailUrl(fileInfo.id);

            loadImage(thumbnailUrl, this.handleImageLoaded);
        } else if (fileInfo.extension === FileTypes.SVG) {
            loadImage(getFileUrl(fileInfo.id), this.handleImageLoaded);
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
        const {
            compactDisplay,
            fileInfo,
            index
        } = this.props;

        const trimmedFilename = trimFilename(fileInfo.name);
        const canDownload = canDownloadFiles();

        return (
            <div className='post-image__column'>
                <a
                    className='post-image__thumbnail'
                    href='#'
                    onClick={this.onAttachmentClick}
                >
                    {this.state.loaded ? (
                        <FileThumbnail fileInfo={fileInfo}/>
                    ) : (
                        <div className='post-image__load'/>
                    )}
                </a>
                <div className='post-image__details'>
                    <div
                        className='post-image__detail_wrapper'
                        onClick={this.onAttachmentClick}
                    >
                        <div className='post-image__detail'>
                            <span className={'post-image__name'}>
                                {trimmedFilename}
                            </span>
                            <span className='post-image__type'>{fileInfo.extension.toUpperCase()}</span>
                            <span className='post-image__size'>{fileSizeToString(fileInfo.size)}</span>
                        </div>
                    </div>
                    {canDownload &&
                    <FilenameOverlay
                        fileInfo={fileInfo}
                        compactDisplay={compactDisplay}
                        canDownload={canDownload}
                        iconClass={'post-image__download'}
                        index={index}
                    >
                        <DownloadIcon/>
                    </FilenameOverlay>
                    }
                </div>
            </div>
        );
    }
}
