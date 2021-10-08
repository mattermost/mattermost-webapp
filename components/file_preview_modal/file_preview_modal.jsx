// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';

import {getFileDownloadUrl, getFilePreviewUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';
import LoadingImagePreview from 'components/loading_image_preview';
import Constants, {FileTypes, ZoomSettings} from 'utils/constants';
import * as Utils from 'utils/utils';
import AudioVideoPreview from 'components/audio_video_preview';
import CodePreview from 'components/code_preview';
import FileInfoPreview from 'components/file_info_preview';

import ImagePreview from './image_preview';
import './file_preview_modal.scss';
import FilePreviewModalFooter from './file_preview_modal_footer/file_preview_modal_footer';
import FilePreviewModalHeader from './file_preview_modal_header/file_preview_modal_header';
import PopoverBar from './popover_bar';

const PDFPreview = React.lazy(() => import('components/pdf_preview'));

const KeyCodes = Constants.KeyCodes;

export default class FilePreviewModal extends React.PureComponent {
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
        const isMobile = Utils.isMobile();

        this.state = {
            isMobile,
            imageIndex: this.props.startIndex,
            imageHeight: '100%',
            loaded: Utils.fillArray(false, this.props.fileInfos.length),
            progress: Utils.fillArray(0, this.props.fileInfos.length),
            showCloseBtn: false,
            showZoomControls: false,
            scale: Utils.fillArray(ZoomSettings.DEFAULT_SCALE, this.props.fileInfos.length),
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
    handleWindowResize = () => {
        const isMobile = Utils.isMobile();
        if (isMobile !== this.state.isMobile) {
            this.setState({
                isMobile,
            });
        }
    }
    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
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

    onMouseEnterImage = () => {
        this.setState({showCloseBtn: true});
    }

    onMouseLeaveImage = () => {
        this.setState({showCloseBtn: false});
    }

    setScale = (index, scale) => {
        this.setState((prevState) => {
            return {
                scale: {
                    ...prevState.scale,
                    [index]: scale,
                },
            };
        });
    }

    handleZoomIn = () => {
        let newScale = this.state.scale[this.state.imageIndex];
        newScale = Math.min(newScale + ZoomSettings.SCALE_DELTA, ZoomSettings.MAX_SCALE);
        this.setScale(this.state.imageIndex, newScale);
    };

    handleZoomOut = () => {
        let newScale = this.state.scale[this.state.imageIndex];
        newScale = Math.max(newScale - ZoomSettings.SCALE_DELTA, ZoomSettings.MIN_SCALE);
        this.setScale(this.state.imageIndex, newScale);
    };

    handleZoomReset = () => {
        this.setScale(this.state.imageIndex, ZoomSettings.DEFAULT_SCALE);
    }

    handleModalClose = () => {
        this.props.onModalDismissed();
        this.setState({scale: Utils.fillArray(ZoomSettings.DEFAULT_SCALE, this.props.fileInfos.length)});
    }
    handleBgClose = (e) => {
        if (e.currentTarget === e.target) {
            this.handleModalClose();
        }
    }

    render() {
        if (this.props.fileInfos.length < 1 || this.props.fileInfos.length - 1 < this.state.imageIndex) {
            return null;
        }

        const fileInfo = this.props.fileInfos[this.state.imageIndex];
        const showPublicLink = !fileInfo.link;
        const fileName = fileInfo.name || fileInfo.link;
        const fileType = Utils.getFileType(fileInfo.extension);
        const fileUrl = fileInfo.link || getFileUrl(fileInfo.id);
        const fileDownloadUrl = fileInfo.link || getFileDownloadUrl(fileInfo.id);
        const isExternalFile = !fileInfo.id;
        let dialogClassName = 'a11y__modal modal-image file-preview-modal';

        let content;
        let modalImageClass = '';
        let zoomBar;

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
                modalImageClass = ' file-preview-modal__content-scrollable';
                content = (
                    <div
                        className='file-preview-modal__scrollable'
                        onClick={this.handleBgClose}
                    >
                        <React.Suspense fallback={null}>
                            <PDFPreview
                                fileInfo={fileInfo}
                                fileUrl={fileUrl}
                                scale={this.state.scale[this.state.imageIndex]}
                                handleBgClose={this.handleBgClose}
                            />
                        </React.Suspense>
                    </div>
                );
                zoomBar = (
                    <PopoverBar
                        scale={this.state.scale[this.state.imageIndex]}
                        showZoomControls={this.state.showZoomControls}
                        handleZoomIn={this.handleZoomIn}
                        handleZoomOut={this.handleZoomOut}
                        handleZoomReset={this.handleZoomReset}
                    />
                );
            } else if (CodePreview.supports(fileInfo)) {
                dialogClassName += ' modal-code';
                content = (
                    <CodePreview
                        fileInfo={fileInfo}
                        fileUrl={fileUrl}
                        className='file-preview-modal__code-preview'
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

        return (
            <Modal
                show={this.props.show}
                onHide={this.handleModalClose}
                className='modal-image file-preview-modal'
                dialogClassName={dialogClassName}
                animation={true}
                backdrop={false}
                role='dialog'
                style={{paddingLeft: 0}}
                aria-labelledby='viewImageModalLabel'
            >
                <Modal.Body className='file-preview-modal__body'>
                    <div
                        className={'modal-image__wrapper'}
                        onClick={this.handleModalClose}
                    >
                        <div
                            className='file-preview-modal__main-ctr'
                            onMouseEnter={this.onMouseEnterImage}
                            onMouseLeave={this.onMouseLeaveImage}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Modal.Title
                                componentClass='div'
                                id='viewImageModalLabel'
                                className='file-preview-modal__title'
                            >
                                <FilePreviewModalHeader
                                    isMobile={this.state.isMobile}
                                    post={this.props.post}
                                    showPublicLink={showPublicLink}
                                    fileIndex={this.state.imageIndex}
                                    totalFiles={this.props.fileInfos?.length}
                                    filename={fileName}
                                    fileURL={fileDownloadUrl}
                                    fileInfo={fileInfo}
                                    enablePublicLink={this.props.enablePublicLink || false}
                                    canDownloadFiles={this.props.canDownloadFiles || false}
                                    isExternalFile={isExternalFile}
                                    handlePrev={this.handlePrev}
                                    handleNext={this.handleNext}
                                    handleModalClose={this.handleModalClose}
                                />
                                {zoomBar}
                            </Modal.Title>
                            <div
                                className={'file-preview-modal__content' + modalImageClass}
                                onClick={this.handleBgClose}
                            >
                                {content}
                            </div>
                            { this.state.isMobile &&
                                <FilePreviewModalFooter
                                    post={this.props.post}
                                    showPublicLink={showPublicLink}
                                    filename={fileName}
                                    fileURL={fileDownloadUrl}
                                    fileInfo={fileInfo}
                                    enablePublicLink={this.props.enablePublicLink || false}
                                    canDownloadFiles={this.props.canDownloadFiles || false}
                                    isExternalFile={isExternalFile}
                                    handlePrev={this.handlePrev}
                                    handleNext={this.handleNext}
                                    handleModalClose={this.handleModalClose}
                                />
                            }
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
