// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';

import {getFilePreviewUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';

import * as GlobalActions from 'actions/global_actions';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils';

import AudioVideoPreview from 'components/audio_video_preview';
import CodePreview from 'components/code_preview';
import FileInfoPreview from 'components/file_info_preview';
import ImagePreview from 'components/image_preview';
import LoadingImagePreview from 'components/loading_image_preview';
import PDFPreview from 'components/pdf_preview';
import ViewImagePopoverBar from 'components/view_image_popover_bar';

const KeyCodes = Constants.KeyCodes;

export default class ViewImageModal extends React.PureComponent {
    static propTypes = {

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
        startIndex: PropTypes.number.isRequired
    };

    static defaultProps = {
        show: false,
        fileInfos: [],
        startIndex: 0
    };

    constructor(props) {
        super(props);

        this.state = {
            imageIndex: this.props.startIndex,
            imageHeight: '100%',
            loaded: Utils.fillArray(false, this.props.fileInfos.length),
            progress: Utils.fillArray(0, this.props.fileInfos.length),
            showFooter: false
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
        if (e.keyCode === KeyCodes.RIGHT) {
            this.handleNext();
        } else if (e.keyCode === KeyCodes.LEFT) {
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

    componentWillReceiveProps(nextProps) {
        if (nextProps.show === true && this.props.show === false) {
            this.onModalShown(nextProps);
        } else if (nextProps.show === false && this.props.show === true) {
            this.onModalHidden();
        }

        if (this.props.fileInfos.length !== nextProps.fileInfos.length) {
            this.setState({
                loaded: Utils.fillArray(false, nextProps.fileInfos.length),
                progress: Utils.fillArray(0, nextProps.fileInfos.length)
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
                    [index]: true
                }
            };
        });
    }

    handleImageProgress = (index, completedPercentage) => {
        this.setState((prevState) => {
            return {
                progress: {
                    ...prevState.progress,
                    [index]: completedPercentage
                }
            };
        });
    }

    handleGetPublicLink = () => {
        this.props.onModalDismissed();

        GlobalActions.showGetPublicLinkModal(this.props.fileInfos[this.state.imageIndex].id);
    }

    onMouseEnterImage = () => {
        this.setState({showFooter: true});
    }

    onMouseLeaveImage = () => {
        this.setState({showFooter: false});
    }

    render() {
        if (this.props.fileInfos.length < 1 || this.props.fileInfos.length - 1 < this.state.imageIndex) {
            return null;
        }

        const fileInfo = this.props.fileInfos[this.state.imageIndex];
        const showPublicLink = !fileInfo.link;
        const fileName = fileInfo.link || fileInfo.name;
        const fileUrl = fileInfo.link || getFileUrl(fileInfo.id);

        let content;
        if (this.state.loaded[this.state.imageIndex]) {
            const fileType = Utils.getFileType(fileInfo.extension);

            if (fileType === 'image' || fileType === 'svg') {
                content = <ImagePreview fileInfo={fileInfo}/>;
            } else if (fileType === 'video' || fileType === 'audio') {
                content = (
                    <AudioVideoPreview
                        fileInfo={fileInfo}
                        fileUrl={fileUrl}
                    />
                );
            } else if (PDFPreview.supports(fileInfo)) {
                content = (
                    <PDFPreview
                        fileInfo={fileInfo}
                        fileUrl={fileUrl}
                    />
                );
            } else if (CodePreview.supports(fileInfo)) {
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
        if (this.state.showFooter) {
            closeButtonClass += ' modal-close--show';
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onModalDismissed}
                className='modal-image'
                dialogClassName='modal-image'
            >
                <Modal.Body
                    modalClassName='modal-image__body'
                    onClick={this.props.onModalDismissed}
                >
                    <div
                        className={'modal-image__wrapper'}
                        onClick={this.props.onModalDismissed}
                    >
                        <div
                            onMouseEnter={this.onMouseEnterImage}
                            onMouseLeave={this.onMouseLeaveImage}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className={closeButtonClass}
                                onClick={this.props.onModalDismissed}
                            />
                            <div className='modal-image__content'>
                                {content}
                            </div>
                            <ViewImagePopoverBar
                                show={this.state.showFooter}
                                showPublicLink={showPublicLink}
                                fileIndex={this.state.imageIndex}
                                totalFiles={this.props.fileInfos.length}
                                filename={fileName}
                                fileURL={fileUrl}
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
