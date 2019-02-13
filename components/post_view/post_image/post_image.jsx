// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {postListScrollChange} from 'actions/global_actions';
import SizeAwareImage from 'components/size_aware_image';
import * as PostUtils from 'utils/post_utils.jsx';

export default class PostImage extends React.PureComponent {
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

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleLoadComplete = () => {
        if (!this.mounted) {
            return;
        }

        if (!this.props.dimensions) {
            postListScrollChange();
        }
        if (this.props.onLinkLoaded) {
            this.props.onLinkLoaded();
        }
    }

    handleLoadError = () => {
        if (!this.mounted) {
            return;
        }

        if (this.props.onLinkLoadError) {
            this.props.onLinkLoadError();
        }
    }

    onImageClick = (e) => {
        e.preventDefault();
        this.props.handleImageClick();
    };

    render() {
        return (
            <div
                className='post__embed-container'
            >
                <SizeAwareImage
                    className='img-div attachment__image cursor--pointer'
                    src={PostUtils.getImageSrc(this.props.link, this.props.hasImageProxy)}
                    dimensions={this.props.dimensions}
                    showLoader={true}
                    onHeightReceived={this.handleLoadComplete}
                    onImageLoadFail={this.handleLoadError}
                    onClick={this.onImageClick}
                />
            </div>
        );
    }
}
