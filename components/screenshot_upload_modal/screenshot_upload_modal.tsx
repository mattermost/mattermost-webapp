// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Button, Modal} from 'react-bootstrap';
import Cropper from 'react-easy-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
        *  Image title to show.
        */
        imgName: PropTypes.string,

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
    onCropChange = (crop) => {
        this.setState({crop});
    }

    onCropComplete = (croppedArea,croppedAreaPixels) => {
        this.props.handleCroppedAreaPixels(croppedAreaPixels);
    }

    onZoomChange = (zoom) => {
        this.setState({zoom});
    }
    handleModalClose = () => {
        console.log(2);
    }
    handleCancel = () => {
        console.log(3);
    }

    render() {
        const cancelButton = (
            <button
                type='button'
                className='btn btn-primary save-button'
                onClick={() => this.props.handleFinalCrop(true)}
                id='cancelModalButton'
            >
                {'cancelText'}
            </button>
        );
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
                classes={{ containerClassName:'container', mediaClassName: 'img screenshot'}}
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
                <Modal.Body className='screenshot'>
                    <div>{originalScreenshotDOMElement}</div>
                </Modal.Body>
                <Modal.Footer style={{background: 'blue'}}>
                    {cancelButton}
                    <button
                        autoFocus={true}
                        type='button'
                        color='white'
                        className='btn btn-primary save-button'
                        onClick={() => this.props.handleFinalCrop(false)}
                        id='confirmModalButton'
                    >
                        {'Crop'}
                    </button>
                </Modal.Footer>
            </Modal>

        );
    }
}
