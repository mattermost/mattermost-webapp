// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import LoadingImagePreview from 'components/loading_image_preview';
import {loadImage} from 'utils/image_utils';

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
        onImageLoaded: PropTypes.func,

        /*
         * A callback that is called when image load fails
         */
        onImageLoadFail: PropTypes.func,

        /*
         * css classes that can added to the img as well as parent div on svg for placeholder
         */
        className: PropTypes.string,
    }

    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
        };

        this.heightTimeout = 0;
    }

    componentDidMount() {
        this.mounted = true;
        this.loadImage();
    }

    componentDidUpdate(prevProps) {
        if (this.props.src !== prevProps.src) {
            this.loadImage();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.stopWaitingForHeight();
    }

    loadImage = () => {
        const image = loadImage(this.props.src, this.handleLoad);

        image.onerror = this.handleError;

        if (!this.props.dimensions) {
            this.waitForHeight(image);
        }
    }

    waitForHeight = (image) => {
        if (image && image.height) {
            if (this.props.onImageLoaded) {
                this.props.onImageLoaded({height: image.height, width: image.width});
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
        if (this.mounted) {
            if (this.props.onImageLoaded && image.height) {
                this.props.onImageLoaded({height: image.height, width: image.width});
            }
            this.setState({
                loaded: true,
                error: false,
            });
        }
    };

    handleError = () => {
        if (this.mounted) {
            this.stopWaitingForHeight();
            if (this.props.onImageLoadFail) {
                this.props.onImageLoadFail();
            }
            this.setState({error: true});
        }
    };

    render() {
        const {
            dimensions,
            src,
            ...props
        } = this.props;

        Reflect.deleteProperty(props, 'showLoader');
        Reflect.deleteProperty(props, 'onImageLoaded');
        Reflect.deleteProperty(props, 'onImageLoadFail');

        if (this.state.error) {
            return null;
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
                {dimensions && dimensions.width && !this.state.loaded ? (
                    <div className={`image-loading__container ${this.props.className}`}>
                        <div>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                                style={{verticalAlign: 'middle', maxHeight: `${dimensions.height}`, maxWidth: `${dimensions.width}`}}
                            />
                        </div>
                    </div>
                ) : (
                    <img
                        {...props}
                        src={src}
                    />
                )}
            </React.Fragment>
        );
    }
}
