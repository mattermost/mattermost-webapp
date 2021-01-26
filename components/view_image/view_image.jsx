// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {getFilePreviewUrl, getFileUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import * as GlobalActions from 'actions/global_actions';
import Constants, {FileTypes, ZoomSettings} from 'utils/constants';
import * as Utils from 'utils/utils';
import AudioVideoPreview from 'components/audio_video_preview';
import CodePreview from 'components/code_preview';
import FileInfoPreview from 'components/file_info_preview';
import LoadingImagePreview from 'components/loading_image_preview';
const PDFPreview = React.lazy(() => import('components/pdf_preview'));

import ImagePreview from './image_preview';
import PopoverBar from './popover_bar';

const KeyCodes = Constants.KeyCodes;

export default class ViewImageModal extends React.PureComponent {
    static propTypes = {

        /**
         * The post the files are attached to
         */
        postId: PropTypes.string,

        /**
         * The post the files are attached to
         */
        post: PropTypes.object,

        /**
         * Set whether to show this modal or not
         */
        show: PropTypes.bool.isRequired,

        /**
         * Function to call when this modal is dismissed
         **/
        onModalDismissed: PropTypes.func.isRequired,

        /**
         * List of FileInfo to view
         **/
        fileInfos: PropTypes.arrayOf(PropTypes.object).isRequired,

        /**
         * The index number of starting image
         **/
        startIndex: PropTypes.number,

        canDownloadFiles: PropTypes.bool,
        enablePublicLink: PropTypes.bool,
        pluginFilePreviewComponents: PropTypes.arrayOf(PropTypes.object),
    };

    static defaultProps = {
        show: false,
        fileInfos: [],
        startIndex: 0,
        pluginFilePreviewComponents: [],
        post: {}, // Needed to avoid proptypes console errors for cases like channel header, which doesn't have a proper value
    };

    constructor(props) {
        super(props);

        this.state = {
            imageIndex: this.props.startIndex,
            imageHeight: '100%',
            loaded: Utils.fillArray(false, this.props.fileInfos.length),
            progress: Utils.fillArray(0, this.props.fileInfos.length),
            showCloseBtn: false,
            showZoomControls: false,
            scale: ZoomSettings.DEFAULT_SCALE,
        };
        this.videoRef = React.createRef();
    }

    handleNext = (e) => {
        if (e) {
            e.stopPropagation();
        }
        let id = this.state.imageIndex + 1;
        if (id > this.props.fileInfos.length - 1) {
            id = 0;
        }
        this.showImage(id);
    }

    handlePrev = (e) => {
        if (e) {
            e.stopPropagation();
        }
        let id = this.state.imageIndex - 1;
        if (id < 0) {
            id = this.props.fileInfos.length - 1;
        }
        this.showImage(id);
    }

    handleKeyPress = (e) => {
        if (Utils.isKeyPressed(e, KeyCodes.RIGHT)) {
            this.handleNext();
        } else if (Utils.isKeyPressed(e, KeyCodes.LEFT)) {
            this.handlePrev();
        }
    }

    onModalShown = (nextProps) => {
        document.addEventListener('keyup', this.handleKeyPress);

        this.showImage(nextProps.startIndex);
    }

    onModalHidden = () => {
        document.removeEventListener('keyup', this.handleKeyPress);

        if (this.videoRef.current) {
            this.videoRef.current.stop();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.show === true && prevProps.show === false) {
            this.onModalShown(this.props);
        } else if (this.props.show === false && prevProps.show === true) {
            this.onModalHidden();
        }
    }

    static getDerivedStateFromProps(props, state) {
        const updatedProps = {};
        if (props.fileInfos[state.imageIndex] && props.fileInfos[state.imageIndex].extension === FileTypes.PDF) {
            updatedProps.showZoomControls = true;
        } else {
            updatedProps.showZoomControls = false;
        }
        if (props.fileInfos.length !== state.prevFileInfosCount) {
            updatedProps.loaded = Utils.fillArray(false, props.fileInfos.length);
            updatedProps.progress = Utils.fillArray(0, props.fileInfos.length);
            updatedProps.prevFileInfosCount = props.fileInfos.length;
        }
        return Object.keys(updatedProps).length ? updatedProps : null;
    }

    showImage = (id) => {
        this.setState({imageIndex: id});

        const imageHeight = window.innerHeight - 100;
        this.setState({imageHeight});

        if (!this.state.loaded[id]) {
            this.loadImage(id);
        }
    }

    loadImage = (index) => {
        const fileInfo = this.props.fileInfos[index];
        const fileType = Utils.getFileType(fileInfo.extension);

        if (fileType === FileTypes.IMAGE && Boolean(fileInfo.id)) {
            let previewUrl;
            if (fileInfo.has_image_preview) {
                previewUrl = getFilePreviewUrl(fileInfo.id);
            } else {
                // some images (eg animated gifs) just show the file itself and not a preview
                previewUrl = getFileUrl(fileInfo.id);
            }

            Utils.loadImage(
                previewUrl,
                () => this.handleImageLoaded(index),
                (completedPercentage) => this.handleImageProgress(index, completedPercentage),
            );
        } else {
            // there's nothing to load for non-image files
            this.handleImageLoaded(index);
        }
    }

    handleImageLoaded = (index) => {
        this.setState((prevState) => {
            return {
                loaded: {
                    ...prevState.loaded,
                    [index]: true,
                },
            };
        });
    }

    handleImageProgress = (index, completedPercentage) => {
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
        this.handleModalClose();

        GlobalActions.showGetPublicLinkModal(this.props.fileInfos[this.state.imageIndex].id);
    }

    onMouseEnterImage = () => {
        this.setState({showCloseBtn: true});
    }

    onMouseLeaveImage = () => {
        this.setState({showCloseBtn: false});
    }

    handleZoomIn = () => {
        let newScale = this.state.scale;
        newScale = Math.min(newScale + ZoomSettings.SCALE_DELTA, ZoomSettings.MAX_SCALE);
        this.setState({scale: newScale});
    };

    handleZoomOut = () => {
        let newScale = this.state.scale;
        newScale = Math.max(newScale - ZoomSettings.SCALE_DELTA, ZoomSettings.MIN_SCALE);
        this.setState({scale: newScale});
    };

    handleZoomReset = () => {
        this.setState({scale: ZoomSettings.DEFAULT_SCALE});
    }

    handleModalClose = () => {
        this.props.onModalDismissed();
        this.setState({scale: ZoomSettings.DEFAULT_SCALE});
    }

    render() {
        if (this.props.fileInfos.length < 1 || this.props.fileInfos.length - 1 < this.state.imageIndex) {
            return null;
        }

        const fileInfo = this.props.fileInfos[this.state.imageIndex];
        const showPublicLink = !fileInfo.link;
        const fileName = fileInfo.link || fileInfo.name;
        const fileType = Utils.getFileType(fileInfo.extension);
        const fileUrl = fileInfo.link || getFileUrl(fileInfo.id);
        const fileDownloadUrl = fileInfo.link || getFileDownloadUrl(fileInfo.id);
        const isExternalFile = !fileInfo.id;
        let dialogClassName = 'a11y__modal modal-image';

        let content;
        let modalImageClass = '';

        if (this.state.loaded[this.state.imageIndex]) {
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
            } else if (fileType === FileTypes.PDF) {
                modalImageClass = ' modal-auto__content';
                content = (
                    <div className='pdf'>
                        <React.Suspense fallback={null}>
                            <PDFPreview
                                fileInfo={fileInfo}
                                fileUrl={fileUrl}
                                scale={this.state.scale}
                            />
                        </React.Suspense>
                    </div>
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
            if (preview.override(fileInfo, this.props.post)) {
                content = (
                    <preview.component
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
                    ref={this.previewArrowLeft}
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
                    ref={this.previewArrowRight}
                    className='modal-next-bar'
                    href='#'
                    onClick={this.handleNext}
                >
                    <i className='image-control image-next'/>
                </a>
            );
        }

        let closeButton;
        if (this.state.showCloseBtn) {
            closeButton = (
                <div
                    className='modal-close'
                    onClick={this.handleModalClose}
                />
            );
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.handleModalClose}
                className='modal-image'
                dialogClassName={dialogClassName}
                role='dialog'
                aria-labelledby='viewImageModalLabel'
            >
                <Modal.Body>
                    <div
                        className={'modal-image__wrapper'}
                        onClick={this.handleModalClose}
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
                            {closeButton}
                            <div className='modal-image__background'>
                                <div className={`modal-image__content${modalImageClass}`}>
                                    {content}
                                </div>
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
                                scale={this.state.scale}
                                showZoomControls={this.state.showZoomControls}
                                handleZoomIn={this.handleZoomIn}
                                handleZoomOut={this.handleZoomOut}
                                handleZoomReset={this.handleZoomReset}
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
