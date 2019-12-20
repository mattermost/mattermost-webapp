// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';
import LoadingImagePreview from 'components/loading_image_preview';

const MIN_IMAGE_SIZE = 48;

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
        fileInfo: PropTypes.object,

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
         * Fetch the onClick function
         */
        onClick: PropTypes.func,

        /*
         * css classes that can added to the img as well as parent div on svg for placeholder
         */
        className: PropTypes.string,

        /*
         * Enables the logic of surrounding small images with a bigger container div for better click/tap targeting
         */
        handleSmallImageContainer: PropTypes.bool,
    }

    constructor(props) {
        super(props);
        const {dimensions} = props;

        this.state = {
            loaded: false,
            isSmallImage: this.dimensionsAvailable(dimensions) ? this.isSmallImage(
                dimensions.width, dimensions.height) : false,
        };

        this.heightTimeout = 0;
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    dimensionsAvailable = (dimensions) => {
        return dimensions && dimensions.width && dimensions.height;
    }

    isSmallImage = (width, height) => {
        return width < MIN_IMAGE_SIZE || height < MIN_IMAGE_SIZE;
    }

    handleLoad = (event) => {
        if (this.mounted) {
            const image = event.target;
            const isSmallImage = this.isSmallImage(image.naturalWidth, image.naturalHeight);
            this.setState({
                loaded: true,
                error: false,
                isSmallImage,
                imageWidth: image.naturalWidth,
            }, () => { // Call onImageLoaded prop only after state has already been set
                if (this.props.onImageLoaded && image.naturalHeight) {
                    this.props.onImageLoaded({height: image.naturalHeight, width: image.naturalWidth});
                }
            });
        }
    };

    handleError = () => {
        if (this.mounted) {
            if (this.props.onImageLoadFail) {
                this.props.onImageLoadFail();
            }
            this.setState({error: true});
        }
    };

    onEnterKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.props.onClick(e);
        }
    }

    renderImageLoaderIfNeeded = () => {
        if (!this.state.loaded && this.props.showLoader && !this.state.error) {
            return (
                <div style={{position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', left: '50%'}}>
                    <LoadingImagePreview
                        containerClass={'file__image-loading'}
                    />
                </div>
            );
        }
        return null;
    }

    renderImageWithContainerIfNeeded = () => {
        const {
            fileInfo,
            src,
            ...props
        } = this.props;

        Reflect.deleteProperty(props, 'showLoader');
        Reflect.deleteProperty(props, 'onImageLoaded');
        Reflect.deleteProperty(props, 'onImageLoadFail');
        Reflect.deleteProperty(props, 'dimensions');
        Reflect.deleteProperty(props, 'handleSmallImageContainer');

        let ariaLabelImage = localizeMessage('file_attachment.thumbnail', 'file thumbnail');
        if (fileInfo) {
            ariaLabelImage += ` ${fileInfo.name}`.toLowerCase();
        }

        const image = (
            <img
                {...props}
                aria-label={ariaLabelImage}
                tabIndex='0'
                onKeyDown={this.onEnterKeyDown}
                className={
                    this.props.className +
                    (this.props.handleSmallImageContainer &&
                        this.state.isSmallImage ? ' small-image--inside-container' : '')}
                src={src}
                onError={this.handleError}
                onLoad={this.handleLoad}
            />
        );

        if (this.props.handleSmallImageContainer && this.state.isSmallImage) {
            let className = 'small-image__container cursor--pointer a11y--active';
            if (this.state.imageWidth < MIN_IMAGE_SIZE) {
                className += ' small-image__container--min-width';
            }

            return (
                <div
                    onClick={this.props.onClick}
                    className={className}
                    style={this.state.imageWidth > MIN_IMAGE_SIZE ? {
                        width: this.state.imageWidth + 2, // 2px to account for the border
                    } : {}}
                >
                    {image}
                </div>
            );
        }

        return image;
    }

    renderImageOrPlaceholder = () => {
        const {
            dimensions,
        } = this.props;

        let placeHolder;

        if (this.dimensionsAvailable(dimensions) && !this.state.loaded) {
            placeHolder = (
                <div
                    className={`image-loading__container ${this.props.className}`}
                    style={{maxWidth: dimensions.width}}
                >
                    {this.renderImageLoaderIfNeeded()}
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                        style={{maxHeight: dimensions.height, maxWidth: dimensions.width, verticalAlign: 'middle'}}
                    />
                </div>
            );
        }

        const shouldShowImg = !this.dimensionsAvailable(dimensions) || this.state.loaded;

        return (
            <React.Fragment>
                {placeHolder}
                <div
                    className='file-preview__button'
                    style={{display: shouldShowImg ? 'initial' : 'none'}}
                >
                    {this.renderImageWithContainerIfNeeded()}
                </div>
            </React.Fragment>
        );
    }

    render() {
        return (
            this.renderImageOrPlaceholder()
        );
    }
}
