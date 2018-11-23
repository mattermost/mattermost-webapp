// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import LoadingImagePreview from 'components/loading_image_preview';
import * as PostUtils from 'utils/post_utils.jsx';
import {getFileDimensionsForDisplay} from 'utils/file_utils';

const MAX_IMAGE_DIMENSIONS = {
    maxHeight: 500,
    maxWidth: 450,
};

export default class PostImageEmbed extends React.PureComponent {
    static propTypes = {

        /**
         * The link to load the image from
         */
        link: PropTypes.string.isRequired,

        /**
         * Function to call when image is loaded
         */
        onLinkLoaded: PropTypes.func,

        /**
         * The function to call if image load fails
         */
        onLinkLoadError: PropTypes.func,

        /**
         * The function to call if image is clicked
         */
        handleImageClick: PropTypes.func,

        /**
         * If an image proxy is enabled.
         */
        hasImageProxy: PropTypes.bool.isRequired,

        /**
         * dimensions for empty space to prevent scroll popup.
         */
        dimensions: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this.handleLoadComplete = this.handleLoadComplete.bind(this);
        this.handleLoadError = this.handleLoadError.bind(this);

        this.state = {
            loaded: false,
            errored: false,
        };
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        this.loadImg(this.props.link);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.link !== this.props.link) {
            this.setState({
                loaded: false,
                errored: false,
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.state.loaded && prevProps.link !== this.props.link) {
            this.loadImg(this.props.link);
        }
    }

    loadImg(src) {
        const img = new Image();
        img.onload = this.handleLoadComplete;
        img.onerror = this.handleLoadError;
        img.src = PostUtils.getImageSrc(src, this.props.hasImageProxy);
    }

    handleLoadComplete() {
        this.setState({
            loaded: true,
            errored: false,
        });

        if (this.props.onLinkLoaded) {
            this.props.onLinkLoaded();
        }
    }

    handleLoadError() {
        this.setState({
            errored: true,
            loaded: true,
        });
        if (this.props.onLinkLoadError) {
            this.props.onLinkLoadError();
        }
    }

    onImageClick = (e) => {
        e.preventDefault();
        this.props.handleImageClick();
    };

    render() {
        const imageDimensions = getFileDimensionsForDisplay(this.props.dimensions, MAX_IMAGE_DIMENSIONS);
        if (this.state.errored || !this.state.loaded) {
            return (
                <div style={{...imageDimensions, marginBottom: '13px'}}>
                    <LoadingImagePreview
                        containerClass={'file__image-loading'}
                    />
                </div>
            );
        }

        return (
            <div
                className='post__embed-container'
            >
                <img
                    onClick={this.onImageClick}
                    className='img-div cursor--pointer'
                    src={PostUtils.getImageSrc(this.props.link, this.props.hasImageProxy)}
                    {...imageDimensions}
                />
            </div>
        );
    }
}
