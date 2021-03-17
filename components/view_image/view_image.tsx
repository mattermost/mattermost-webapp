// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {getFilePreviewUrl, getFileUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import {FileInfo} from 'mattermost-redux/types/files';

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

export type Props = {

    /**
 * The post the files are attached to
 */
    postId?: string;

    /**
 * The post the files are attached to
 */
    post?: any;

    /**
 * Set whether to show this modal or not
 */
    show?: boolean;

    /**
 * Function to call when this modal is dismissed
 **/
    onModalDismissed?: () => void;

    /**
 * List of FileInfo to view
 **/
    fileInfos?: FileInfo[];

    /**
 * The index number of starting image
 **/
    startIndex?: number;

    canDownloadFiles?: boolean;
    enablePublicLink?: boolean;
    pluginFilePreviewComponents?: any[];
};

type State = {
    imageIndex?: number;
    imageHeight: string;
    loaded: boolean[];
    progress: number[];
    showCloseBtn: boolean;
    showZoomControls: boolean;
    scale: number[];

}

export default class ViewImageModal extends React.PureComponent<Props, State> {
    static defaultProps = {
        show: false,
        fileInfos: [],
        startIndex: 0,
        pluginFilePreviewComponents: [],
        post: {}, // Needed to avoid proptypes console errors for cases like channel header, which doesn't have a proper value
    };
    videoRef: React.RefObject<any>;

    constructor(props: Props) {
        super(props);

        const fileInfoLength = this.props?.fileInfos?.length;

        this.state = {
            imageIndex: this.props.startIndex,
            imageHeight: '100%',
            // eslint-disable-next-line react/prop-types
            loaded: Utils.fillArray(false, fileInfoLength),
            // eslint-disable-next-line react/prop-types
            progress: Utils.fillArray(0, fileInfoLength),
            showCloseBtn: false,
            showZoomControls: false,
            // eslint-disable-next-line react/prop-types
            scale: Utils.fillArray(ZoomSettings.DEFAULT_SCALE, fileInfoLength),
        };
        this.videoRef = React.createRef();
    }

    handleNext = (e?: TransitionEvent): void => {
        if (e) {
            e.stopPropagation();
        }
        let id = this.state.imageIndex + 1;
        if (id > this.props.fileInfos.length - 1) {
            id = 0;
        }
        this.showImage(id);
    }

    handlePrev = (e?: TransitionEvent): void => {
        if (e) {
            e.stopPropagation();
        }
        let id = this.state.imageIndex - 1;
        if (id < 0) {
            id = this.props.fileInfos.length - 1;
        }
        this.showImage(id);
    }

    handleKeyPress = (e: KeyboardEvent): void => {
        if (Utils.isKeyPressed(e, KeyCodes.RIGHT)) {
            this.handleNext();
        } else if (Utils.isKeyPressed(e, KeyCodes.LEFT)) {
            this.handlePrev();
        }
    }

    onModalShown = (nextProps: Props): void => {
        document.addEventListener('keyup', this.handleKeyPress);

        this.showImage(nextProps.startIndex);
    }

    onModalHidden = (): void => {
        document.removeEventListener('keyup', this.handleKeyPress);

        if (this.videoRef.current) {
            this.videoRef.current.stop();
        }
    }

    componentDidUpdate(prevProps: Props): void {
        if (this.props.show === true && prevProps.show === false) {
            this.onModalShown(this.props);
        } else if (this.props.show === false && prevProps.show === true) {
            this.onModalHidden();
        }
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        const updatedProps = {};
        if (props?.fileInfos[state.imageIndex] && props.fileInfos[state.imageIndex].extension === FileTypes.PDF) {
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

    showImage = (id: number): void => {
        this.setState({imageIndex: id});

        const imageHeight = window.innerHeight - 100;
        this.setState({imageHeight});

        if (!this.state.loaded[id]) {
            this.loadImage(id);
        }
    }

    loadImage = (index: number): void => {
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
        this.handleModalClose();

        GlobalActions.showGetPublicLinkModal(this.props.fileInfos[this.state.imageIndex].id);
    }

    onMouseEnterImage = () => {
        this.setState({showCloseBtn: true});
    }

    onMouseLeaveImage = () => {
        this.setState({showCloseBtn: false});
    }

    setScale = (index: any, scale: number) => {
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

    public render(): JSX.Element | null {
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
                                scale={this.state.scale[this.state.imageIndex]}
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
                                scale={this.state.scale[this.state.imageIndex]}
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
