// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import Cropper from 'react-easy-crop';

export default class ScreenshotUploadModal extends React.PureComponent<Props, State> {
    static propTypes = {

        /**
         * Function that is called when modal is hidden
         */
        onHide: PropTypes.func.isRequired,

        /**
         * Image url to show.
         */
        imgURL: PropTypes.string,

        /**
        *  Aspect ratio (Think of a scenario where user pastes screenshot of 2 or more screen, he might want to crop it for one of his screens. In this case we want to provide a shortcut for him to save his time.).
        */
        aspectRatio: PropTypes.number,

        /**
        *  React-easy-crop library returns cropped area pixels during crop operation, and we need to pass that to file upload component.
        */
        handleCroppedAreaPixels: PropTypes.func,

        /**
        *  Handle final crop state.
        */
        handleFinalCrop: PropTypes.func,

    };
    cropperRef: React.RefObject<unknown>;

    constructor(props: Props) {
        super(props);
        this.cropperRef = React.createRef();
        this.state = {
            show: true,
            crop: {x: 0, y: 0},
            zoom: 1,
            aspect: 16 / 9,

        };
    }
    onCropChange = (crop): void => {
        this.setState({crop});
    }

    onCropComplete = (croppedArea,croppedAreaPixels): void => {
        this.props.handleCroppedAreaPixels(croppedAreaPixels);
    }

    onZoomChange = (zoom: number): void => {
        this.setState({zoom});
    }

    handleButtonClick =(shouldCrop: boolean): void => {
        this.props.handleFinalCrop(shouldCrop);
        this.props.onHide();
    }

    render() {
        const fullyUploadButton = (
            <button
                type='button'
                className='btn btn-primary save-button'
                onClick={() => this.handleButtonClick(false)}
                id='fullyUploadButton'
            >
                {'Upload full'}
            </button>
        );
        const cropButton = (
            <button
                type='button'
                className='btn btn-primary save-button'
                onClick={() => this.handleButtonClick(true)}
                id='cropButton'
            >
                {'Crop'}
            </button>
        );

        //React-easy-crop is chosen over react-cropper due to this https://github.com/react-cropper/react-cropper/issues/555
        const originalScreenshotDOMElement = (
            <Cropper
                image={this.props.imgURL}
                crop={this.state.crop}
                zoom={this.state.zoom}
                aspect={this.props.aspectRatio}
                onCropChange={this.onCropChange}
                onCropComplete={this.onCropComplete}
                onZoomChange={this.onZoomChange}
                showGrid={false}
                classes={{containerClassName: 'container', mediaClassName: 'img screenshot'}}
            />
        );
        return (
            <Modal
                show={this.state.show}
                onHide={this.props.onHide}
                dialogClassName='a11y__modal modal-image screenshot'
                role='dialog'
                aria-labelledby='screenshotUploadModalLabel'
            >
                <Modal.Header
                    closeButton={true}
                >
                    <div>{'Please crop...'}</div>
                </Modal.Header>
                <Modal.Body className='screenshot'>
                    <div>{originalScreenshotDOMElement}</div>
                </Modal.Body>
                <Modal.Footer>
                    {fullyUploadButton}
                    {cropButton}
                </Modal.Footer>
            </Modal>
        );
    }
}
