// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {getFilePreviewUrl, getFileUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import * as GlobalActions from 'actions/global_actions';
import Constants, {FileTypes} from 'utils/constants';
import * as Utils from 'utils/utils';
import AudioVideoPreview from 'components/audio_video_preview';
import CodePreview from 'components/code_preview';
import FileInfoPreview from 'components/file_info_preview';
import LoadingImagePreview from 'components/loading_image_preview';
const PDFPreview = React.lazy(() => import('components/pdf_preview'));

import ImagePreview from './image_preview';
import PopoverBar from './popover_bar';
import {Post, PostMetadata} from 'mattermost-redux/types/posts';
import {FileInfo} from 'mattermost-redux/types/files';
import {PluginComponent} from 'types/store/plugins';

const KeyCodes = Constants.KeyCodes;

type ViewImageModalProps = {
    /**
     * The post the files are attached to
     */
    post: Post;

    /**
     * Set whether to show this modal or not
     */
    show: boolean;

    /**
     * Function to call when this modal is dismissed
     **/
     onModalDismissed: () => void;

    /**
     * List of FileInfo to view
     **/
    fileInfos: Array<any>;
    /**
     * The index number of starting image
     **/
    startIndex: number;

    canDownloadFiles: boolean;
    enablePublicLink: boolean;
    pluginFilePreviewComponents: PluginComponent[];

}

type ViewImageModalState = {
    imageIndex: number;
    imageHeight: number;
    loaded: any[];
    progress: any[];
    showCloseBtn: boolean;
    prevFileInfosCount?: number;
}

export default class ViewImageModal extends React.PureComponent<ViewImageModalProps, ViewImageModalState> {

    static defaultProps: Partial<ViewImageModalProps> = {
        show: false,
        fileInfos: [],
        startIndex: 0,
        pluginFilePreviewComponents: [],
       
    };

    constructor(props: ViewImageModalProps) {
        super(props);

        this.state = {
            imageIndex: this.props.startIndex,
            imageHeight: 100,
            loaded: Utils.fillArray(false, this.props.fileInfos.length),
            progress: Utils.fillArray(0, this.props.fileInfos.length),
            showCloseBtn: false,
        };
    }

    handleNext = (e: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        let id = this.state.imageIndex + 1;
        if (id > this.props.fileInfos.length - 1) {
            id = 0;
        }
        this.showImage(id);
    }

    handlePrev = (e: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        let id = this.state.imageIndex - 1;
        if (id < 0) {
            id = this.props.fileInfos.length - 1;
        }
        this.showImage(id);
    }

    handleKeyPress = (e: any) => {
        if (Utils.isKeyPressed(e, KeyCodes.RIGHT)) {
            this.handleNext(e);
        } else if (Utils.isKeyPressed(e, KeyCodes.LEFT)) {
            this.handlePrev(e);
        }
    }

    onModalShown = (nextProps: ViewImageModalProps) => {
        document.addEventListener('keyup', this.handleKeyPress);

        this.showImage(nextProps.startIndex);
    }

    onModalHidden = () => {
        document.removeEventListener('keyup', this.handleKeyPress);

        if (this.refs.video) {
            //@ts-ignore
            this.refs.video.stop();
        }
    }

    componentDidUpdate(prevProps: ViewImageModalProps) {
        if (this.props.show === true && prevProps.show === false) {
            this.onModalShown(this.props);
        } else if (this.props.show === false && prevProps.show === true) {
            this.onModalHidden();
        }
    }

    static getDerivedStateFromProps(props: ViewImageModalProps, state: ViewImageModalState) {
        if (props.fileInfos.length !== state.prevFileInfosCount) {
            return {
                loaded: Utils.fillArray(false, props.fileInfos.length),
                progress: Utils.fillArray(0, props.fileInfos.length),
                prevFileInfosCount: props.fileInfos.length,
            };
        }
        return null;
    }

    showImage = (id: number) => {
        this.setState({imageIndex: id});

        const imageHeight = window.innerHeight - 100;
        this.setState({imageHeight: imageHeight});

        if (!this.state.loaded[id]) {
            this.loadImage(id);
        }
    }

    loadImage = (index: number) => {
        const fileInfo: FileInfo = this.props.fileInfos[index];
        const fileType = Utils.getFileType(fileInfo.extension);

        if (fileType === FileTypes.IMAGE && Boolean(fileInfo.id)) {
            let previewUrl;
            if (fileInfo.has_preview_image) {
                previewUrl = getFilePreviewUrl(fileInfo.id);
            } else {
                // some images (eg animated gifs) just show the file itself and not a preview
                previewUrl = getFileUrl(fileInfo.id);
            }

            Utils.loadImage(
                previewUrl,
                () => this.handleImageLoaded(index),
                (completedPercentage: any) => this.handleImageProgress(index, completedPercentage),
            );
        } else {
            // there's nothing to load for non-image files
            this.handleImageLoaded(index);
        }
    }

    handleImageLoaded = (index: number) => {
        this.setState((prevState) => {
            return {
                loaded: {
                    ...prevState.loaded,
                    [index]: true,
                },
            };
        });
    }

    handleImageProgress = (index: number, completedPercentage: any) => {
        this.setState((prevState) => {
            return {
                progress: {
                    ...prevState.progress,
                    [index]: completedPercentage,
                },
            };
        });
    }

    handleGetPublicLink = () => {
        this.props.onModalDismissed();

        GlobalActions.showGetPublicLinkModal(this.props.fileInfos[this.state.imageIndex].id);
    }

    onMouseEnterImage = () => {
        this.setState({showCloseBtn: true});
    }

    onMouseLeaveImage = () => {
        this.setState({showCloseBtn: false});
    }

    render() {
        if (this.props.fileInfos.length < 1 || this.props.fileInfos.length - 1 < this.state.imageIndex) {
            return null;
        }

        const fileInfo = this.props.fileInfos[this.state.imageIndex];
        const showPublicLink = !fileInfo.link;
        const fileName = fileInfo.link || fileInfo.name;
        const fileUrl = fileInfo.link || getFileUrl(fileInfo.id);
        const fileDownloadUrl = fileInfo.link || getFileDownloadUrl(fileInfo.id);
        const isExternalFile = !fileInfo.id;
        let dialogClassName = 'a11y__modal modal-image';

        let content;
        if (this.state.loaded[this.state.imageIndex]) {
            const fileType = Utils.getFileType(fileInfo.extension);

            if (fileType === FileTypes.IMAGE || fileType === FileTypes.SVG) {
                content = (
                    <ImagePreview
                        fileInfo={fileInfo}
                        canDownloadFiles={this.props.canDownloadFiles}
                    />
                );
            } else if (fileType === FileTypes.VIDEO || fileType === FileTypes.AUDIO) {
                content = (
                    <AudioVideoPreview
                        fileInfo={fileInfo}
                        fileUrl={fileUrl}
                    />
                );
            } else if (fileInfo && fileInfo.extension && fileInfo.extension === FileTypes.PDF) {
                content = (
                    <React.Suspense fallback={null}>
                        <PDFPreview
                            fileInfo={fileInfo}
                            fileUrl={fileUrl}
                        />
                    </React.Suspense>
                );
            } else if (CodePreview.supports(fileInfo)) {
                dialogClassName += ' modal-code';
                content = (
                    <CodePreview
                        fileInfo={fileInfo}
                        fileUrl={fileUrl}
                    />
                );
            } else {
                content = (
                    <FileInfoPreview
                        fileInfo={fileInfo}
                        fileUrl={fileUrl}
                    />
                );
            }
        } else {
            // display a progress indicator when the preview for an image is still loading
            const loading = Utils.localizeMessage('view_image.loading', 'Loading');
            const progress = Math.floor(this.state.progress[this.state.imageIndex]);

            content = (
                <LoadingImagePreview
                    loading={loading}
                    progress={progress}
                />
            );
        }

        for (const preview of this.props.pluginFilePreviewComponents) {
            //@ts-ignore
            if (preview.override(fileInfo, this.props.post)) {
                content = (
                    //@ts-ignore
                    <preview.component
                        //@ts-ignore
                        fileInfo={fileInfo}
                        post={this.props.post}
                        onModalDismissed={this.props.onModalDismissed}
                    />
                );
                break;
            }
        }

        let leftArrow = null;
        let rightArrow = null;
        if (this.props.fileInfos.length > 1) {
            leftArrow = (
                <a
                    id='previewArrowLeft'
                    ref='previewArrowLeft'
                    className='modal-prev-bar'
                    href='#'
                    onClick={this.handlePrev}
                >
                    <i className='image-control image-prev'/>
                </a>
            );

            rightArrow = (
                <a
                    id='previewArrowRight'
                    ref='previewArrowRight'
                    className='modal-next-bar'
                    href='#'
                    onClick={this.handleNext}
                >
                    <i className='image-control image-next'/>
                </a>
            );
        }

        let closeButtonClass = 'modal-close';
        if (this.state.showCloseBtn) {
            closeButtonClass += ' modal-close--show';
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onModalDismissed}
                className='modal-image'
                dialogClassName={dialogClassName}
                role='dialog'
                aria-labelledby='viewImageModalLabel'
            >
                <Modal.Body>
                    <div
                        className={'modal-image__wrapper'}
                        onClick={this.props.onModalDismissed}
                    >
                        <div
                            onMouseEnter={this.onMouseEnterImage}
                            onMouseLeave={this.onMouseLeaveImage}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Modal.Title
                                componentClass='h1'
                                id='viewImageModalLabel'
                                className='hide'
                            >
                                {fileName}
                            </Modal.Title>
                            <div
                                className={closeButtonClass}
                                onClick={this.props.onModalDismissed}
                            />
                            <div className='modal-image__content'>
                                {content}
                            </div>
                            <PopoverBar
                                showPublicLink={showPublicLink}
                                fileIndex={this.state.imageIndex}
                                totalFiles={this.props.fileInfos.length}
                                filename={fileName}
                                fileURL={fileDownloadUrl}
                                enablePublicLink={this.props.enablePublicLink}
                                canDownloadFiles={this.props.canDownloadFiles}
                                isExternalFile={isExternalFile}
                                onGetPublicLink={this.handleGetPublicLink}
                            />
                        </div>
                    </div>
                    {leftArrow}
                    {rightArrow}
                </Modal.Body>
            </Modal>
        );
    }
}
/* eslint-enable react/no-string-refs */
