// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {createPlaceholderImage, loadImage} from 'utils/image_utils';

const WAIT_FOR_HEIGHT_TIMEOUT = 100;

// SizeAwareImage is a component used for rendering images where the dimensions of the image are important for
// ensuring that the page is laid out correctly.
export default class SizeAwareImage extends React.PureComponent {
    static propTypes = {

        /*
         * dimensions object to create empty space required to prevent scroll pop
         */
        dimensions: PropTypes.object,

        /*
         * A callback that is called as soon as the image component has a height value
         */
        onHeightReceived: PropTypes.func.isRequired,

        /*
         * The source URL of the image
         */
        src: PropTypes.string.isRequired,
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
        const wasWaiting = this.stopWaitingForHeight();

        if ((wasWaiting || !this.props.dimensions) && this.props.onHeightReceived) {
            this.props.onHeightReceived(image.height);
        }

        this.setState({
            loaded: true,
        });
    };

    handleError = () => {
        this.stopWaitingForHeight();
    };

    render() {
        const {
            dimensions,
            ...props
        } = this.props;

        Reflect.deleteProperty(props, 'onHeightReceived');

        let src;
        if (!this.state.loaded && dimensions) {
            // Generate a blank image as a placeholder because that will scale down to fit the available space
            // while maintaining the correct aspect ratio
            src = createPlaceholderImage(dimensions.width, dimensions.height);
        } else {
            src = this.props.src;
        }

        return (
            <img
                {...props}
                src={src}
            />
        );
    }
}
