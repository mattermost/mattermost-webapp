// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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

const KeyCodes = Constants.KeyCodes;

export default class ViewImageModal extends React.PureComponent {
    static propTypes = {

        /**
         * The post the files are attached to
         */
        post: PropTypes.object.isRequired,

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
        startIndex: PropTypes.number.isRequired,

        canDownloadFiles: PropTypes.bool.isRequired,
        enablePublicLink: PropTypes.bool.isRequired,
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
        };
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
        document.addEventListener('keyup', this.handleKeyPress);

        if (this.refs.video) {
            this.refs.video.stop();
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.show === true && this.props.show === false) {
            this.onModalShown(nextProps);
        } else if (nextProps.show === false && this.props.show === true) {
            this.onModalHidden();
        }

        if (this.props.fileInfos.length !== nextProps.fileInfos.length) {
            this.setState({
                loaded: Utils.fillArray(false, nextProps.fileInfos.length),
                progress: Utils.fillArray(0, nextProps.fileInfos.length),
            });
        }
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
                (completedPercentage) => this.handleImageProgress(index, completedPercentage)
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
            if (preview.override(fileInfo, this.props.post)) {
                content = (
                    <preview.component
                        fileInfo={fileInfo}
                        post={this.props.post}
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
