// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import LoadingImagePreview from 'components/loading_image_preview';
import {createPlaceholderImage, loadImage} from 'utils/image_utils';

const WAIT_FOR_HEIGHT_TIMEOUT = 100;

// SizeAwareImage is a component used for rendering images where the dimensions of the image are important for
// ensuring that the page is laid out correctly.
export default class SizeAwareImage extends React.PureComponent {
    static propTypes = {

        /*
         * The source URL of the image
         */
        src: PropTypes.string.isRequired,

        /*
         * dimensions object to create empty space required to prevent scroll pop
         */
        dimensions: PropTypes.object,

        /*
         * Boolean value to pass for showing a loader when image is being loaded
         */
        showLoader: PropTypes.bool,

        /*
         * A callback that is called as soon as the image component has a height value
         */
        onHeightReceived: PropTypes.func.isRequired,

        /*
         * A callback that is called when image load fails
         */
        onImageLoadFail: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
        };

        this.heightTimeout = 0;
    }

    componentDidMount() {
        this.loadImage();
    }

    componentDidUpdate(prevProps) {
        if (this.props.src !== prevProps.src) {
            this.loadImage();
        }
    }

    componentWillUnmount() {
        this.stopWaitingForHeight();
    }

    loadImage = () => {
        const image = loadImage(this.props.src, this.handleLoad);

        image.onerror = this.handleError();

        if (!this.props.dimensions) {
            this.waitForHeight(image);
        }
    }

    waitForHeight = (image) => {
        if (image && image.height) {
            if (this.props.onHeightReceived) {
                this.props.onHeightReceived(image.height);
            }
            this.heightTimeout = 0;
        } else {
            this.heightTimeout = setTimeout(() => this.waitForHeight(image), WAIT_FOR_HEIGHT_TIMEOUT);
        }
    }

    stopWaitingForHeight = () => {
        if (this.heightTimeout !== 0) {
            clearTimeout(this.heightTimeout);
            this.heightTimeout = 0;
            return true;
        }
        return false;
    }

    handleLoad = (image) => {
        if (this.props.onHeightReceived && image.height) {
            this.props.onHeightReceived(image.height);
        }

        this.setState({
            loaded: true,
            error: false,
        });
    };

    handleError = () => {
        this.stopWaitingForHeight();
        if (this.props.onImageLoadFail) {
            this.props.onImageLoadFail();
        }
        this.setState({error: true});
    };

    render() {
        const {
            dimensions,
            ...props
        } = this.props;

        Reflect.deleteProperty(props, 'showLoader');
        Reflect.deleteProperty(props, 'onHeightReceived');
        Reflect.deleteProperty(props, 'onImageLoadFail');

        let src;
        if (!this.state.loaded && dimensions) {
            // Generate a blank image as a placeholder because that will scale down to fit the available space
            // while maintaining the correct aspect ratio
            src = createPlaceholderImage(dimensions.width, dimensions.height);
        } else if (this.state.error) {
            return null;
        } else {
            src = this.props.src;
        }

        return (
            <React.Fragment>
                {!this.state.loaded && this.props.showLoader &&
                    <div style={{position: 'absolute'}}>
                        <LoadingImagePreview
                            containerClass={'file__image-loading'}
                        />
                    </div>
                }
                <img
                    {...props}
                    src={src}
                />
            </React.Fragment>
        );
    }
}
