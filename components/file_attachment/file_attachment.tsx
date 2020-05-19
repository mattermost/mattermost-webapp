// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {getFileThumbnailUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';
import {FileInfo} from 'mattermost-redux/types/files';

import {FileTypes} from 'utils/constants';
import {trimFilename} from 'utils/file_utils';
import {
    fileSizeToString,
    getFileType,
    loadImage,
    localizeMessage,
} from 'utils/utils.jsx';

import FilenameOverlay from './filename_overlay';
import FileThumbnail from './file_thumbnail';

interface Props {

    /*
    * File detailed information
    */
    fileInfo: FileInfo;

    /*
    * The index of this attachment preview in the parent FileAttachmentList
    */
    index: number;

    /*
    * Handler for when the thumbnail is clicked passed the index above
    */
    handleImageClick?: (index: number) => void;

    /*
    * Display in compact format
    */
    compactDisplay?: boolean;
    canDownloadFiles?: boolean;
    enableSVGs: boolean;
}

interface State {
    loaded: boolean;
    fileInfo: FileInfo;
}

export default class FileAttachment extends React.PureComponent<Props, State> {
    mounted = false;

    constructor(props: Props) {
        super(props);

        this.state = {
            loaded: getFileType(props.fileInfo.extension) !== FileTypes.IMAGE,
            fileInfo: props.fileInfo,
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.loadFiles();
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        if (nextProps.fileInfo.id !== prevState.fileInfo.id) {
            const extension = nextProps.fileInfo.extension;

            return {
                loaded: getFileType(extension) !== FileTypes.IMAGE && !(nextProps.enableSVGs && extension === FileTypes.SVG),
                fileInfo: nextProps.fileInfo,
            };
        }

        return null;
    }

    componentDidUpdate(prevProps: Props) {
        if (!this.state.loaded && this.props.fileInfo.id !== prevProps.fileInfo.id) {
            this.loadFiles();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    loadFiles = () => {
        const fileInfo = this.props.fileInfo;
        const fileType = getFileType(fileInfo.extension);

        if (fileType === FileTypes.IMAGE) {
            const thumbnailUrl = getFileThumbnailUrl(fileInfo.id);

            loadImage(thumbnailUrl, this.handleImageLoaded);
        } else if (fileInfo.extension === FileTypes.SVG && this.props.enableSVGs) {
            loadImage(getFileUrl(fileInfo.id), this.handleImageLoaded);
        }
    }

    handleImageLoaded = () => {
        if (this.mounted) {
            this.setState({
                loaded: true,
            });
        }
    }

    onAttachmentClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault();

        if ('blur' in e.target) {
            (e.target as HTMLElement).blur();
        }

        if (this.props.handleImageClick) {
            this.props.handleImageClick(this.props.index);
        }
    }

    render() {
        const {
            compactDisplay,
            fileInfo,
        } = this.props;

        const trimmedFilename = trimFilename(fileInfo.name);
        let fileThumbnail;
        let fileDetail;
        const ariaLabelImage = `${localizeMessage('file_attachment.thumbnail', 'file thumbnail')} ${fileInfo.name}`.toLowerCase();

        if (!compactDisplay) {
            fileThumbnail = (
                <a
                    aria-label={ariaLabelImage}
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
            );

            fileDetail = (
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
            );
        }

        let filenameOverlay;
        if (this.props.canDownloadFiles) {
            filenameOverlay = (
                <FilenameOverlay
                    fileInfo={fileInfo}
                    compactDisplay={compactDisplay}
                    canDownload={this.props.canDownloadFiles}
                    handleImageClick={this.onAttachmentClick}
                    iconClass={'post-image__download'}
                >
                    <i className='icon icon-download-outline'/>
                </FilenameOverlay>
            );
        }

        return (
            <div className='post-image__column'>
                {fileThumbnail}
                <div className='post-image__details'>
                    {fileDetail}
                    {filenameOverlay}
                </div>
            </div>
        );
    }
}
