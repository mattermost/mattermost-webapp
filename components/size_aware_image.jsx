// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';
import LoadingImagePreview from 'components/loading_image_preview';

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
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleLoad = (event) => {
        if (this.mounted) {
            const image = event.target;
            if (this.props.onImageLoaded && image.naturalHeight) {
                this.props.onImageLoaded({height: image.naturalHeight, width: image.naturalWidth});
            }
            this.setState({
                loaded: true,
                error: false,
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

    renderImageOrPlaceholder = () => {
        const {
            dimensions,
            fileInfo,
            src,
            ...props
        } = this.props;

        let placeHolder;
        let imageStyleChangesOnLoad = {};
        let ariaLabelImage = localizeMessage('file_attachment.thumbnail', 'file thumbnail');
        if (fileInfo) {
            ariaLabelImage += ` ${fileInfo.name}`.toLowerCase();
        }

        if (dimensions && dimensions.width && !this.state.loaded) {
            placeHolder = (
                <div
                    className={`image-loading__container ${this.props.className}`}
                    style={{maxWidth: dimensions.width}}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                        style={{verticalAlign: 'middle', maxHeight: dimensions.height, maxWidth: dimensions.width}}
                    />
                </div>
            );
        }
        Reflect.deleteProperty(props, 'showLoader');
        Reflect.deleteProperty(props, 'onImageLoaded');
        Reflect.deleteProperty(props, 'onImageLoadFail');

        //The css hack here for loading images in the background can be removed after IE11 is dropped in 5.16v
        //We can go back to https://github.com/mattermost/mattermost-webapp/pull/2924/files
        if (!this.state.loaded && dimensions) {
            imageStyleChangesOnLoad = {position: 'absolute', top: 0, height: 1, width: 1, visibility: 'hidden', overflow: 'hidden'};
        }

        return (
            <React.Fragment>
                {placeHolder}
                <div
                    className='style--none file-preview__button'
                    style={imageStyleChangesOnLoad}
                >
                    <img
                        {...props}
                        aria-label={ariaLabelImage}
                        tabIndex='0'
                        onKeyDown={this.onEnterKeyDown}
                        className={this.props.className}
                        src={src}
                        onError={this.handleError}
                        onLoad={this.handleLoad}
                    />
                </div>
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                {this.renderImageLoaderIfNeeded()}
                {this.renderImageOrPlaceholder()}
            </React.Fragment>
        );
    }
}
