// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import Cropper from 'react-easy-crop';
import 'react-image-crop/dist/ReactCrop.css';
type Props = {
    onHide: () => void;
    imgName?: string;
    imgURL?: string;
};



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
        *  Image name to show.
        */
        imgName: PropTypes.string,

    };
    cropperRef: React.RefObject<unknown>;

    constructor(props: Props) {
        super(props);
        const screenshot = new Image();
        screenshot.src = this.props.imgURL;
        screenshot.onload = () =>{
            console.log(screenshot.width);
        };
        this.cropperRef = React.createRef();
        this.state = {
            show: true,
            crop: { x: 0, y: 0 },
            zoom: 1,
            aspect: 4 / 3,
            screenshot: screenshot,

        };
    }
    onCropChange = (crop) => {
        this.setState({ crop })
    }

    onCropComplete = (croppedArea, croppedAreaPixels) => {
        console.log(croppedArea, croppedAreaPixels)
    }

    onZoomChange = (zoom) => {
        this.setState({ zoom })
    }

    render() {
        const originalScreenshotDOMElement = (
            <Cropper
                image={this.props.imgURL}
                crop={this.state.crop}
                zoom={this.state.zoom}
                aspect={this.state.aspect}
                onCropChange={this.onCropChange}
                onCropComplete={this.onCropComplete}
                onZoomChange={this.onZoomChange}
                showGrid={false}
                classes={{containerClassName: 'crop-container', mediaClassName: 'img screenshot'}}
            />
        );
        return (
            <Modal
                show={this.state.show}
                onHide={this.props.onHide}
                dialogClassName='a11y__modal modal-image'
                role='dialog'
                aria-labelledby='screenshotUploadModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='cscreenshotUploadModalLabel'
                    >
                        <FormattedMessage
                            id='channel_info.about'
                            defaultMessage='About'
                        />
                        <strong>{this.props.imgName}</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div
                        className={'modal-image__wrapper'}
                    >
                        {originalScreenshotDOMElement}
                    </div>

                </Modal.Body>
                <Modal.Footer componentClass='h1'
                        id='fscreenshotUploadModalLabel'>
                
                        
                    >
                        <FormattedMessage
                            id='channel_info.about'
                            defaultMessage='About'
                        />
                        <strong>{this.props.imgName}</strong>
                   
                </Modal.Footer>
            </Modal>

        );
    }
}
