// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SizeAwareImage from 'components/size_aware_image';

import {PostTypes} from 'utils/constants.jsx';
import {useSafeUrl} from 'utils/url';
import {getImageSrc, isSystemMessage} from 'utils/post_utils.jsx';

import {getNearestPoint} from './get_nearest_point';

const DIMENSIONS_NEAREST_POINT_IMAGE = {
    height: 80,
    width: 80,
};

export default class PostAttachmentOpenGraph extends React.PureComponent {
    static propTypes = {

        /**
         * The link to display the open graph data for
         */
        link: PropTypes.string.isRequired,

        /**
         * The ID of the current user
         */
        currentUserId: PropTypes.string,

        /**
         * The post where this link is included
         */
        post: PropTypes.object,

        /**
         * The open graph data to render
         */
        openGraphData: PropTypes.object,

        /**
         * Whether or not the server has an image proxy enabled
         */
        hasImageProxy: PropTypes.bool.isRequired,

        /**
         * Whether or not the server has link previews enabled.
         */
        enableLinkPreviews: PropTypes.bool.isRequired,

        /**
         * Whether or not the user has link previews enabled.
         */
        previewEnabled: PropTypes.bool.isRequired,

        /**
         * Whether or not the image in the OpenGraph preview has been collapsed.
         */
        isEmbedVisible: PropTypes.bool,

        toggleEmbedVisibility: PropTypes.func.isRequired,

        actions: PropTypes.shape({
            editPost: PropTypes.func.isRequired,
        }).isRequired,
    }

    getBestImageUrl = () => {
        return getBestImageUrl(this.props.openGraphData, this.props.post.metadata.images, this.props.hasImageProxy);
    }

    isLargeImage = (imageUrl) => {
        if (!imageUrl) {
            return false;
        }

        const imagesMetadata = this.props.post.metadata.images;
        if (!imagesMetadata) {
            return false;
        }

        const dimensions = imagesMetadata[imageUrl];
        if (!dimensions) {
            return false;
        }
        const {height, width} = dimensions;

        const largeImageMinRatio = 16 / 9;
        const largeImageMinWidth = 150;

        const imageRatio = width / height;

        return width >= largeImageMinWidth && imageRatio >= largeImageMinRatio;
    }

    renderImageToggle() {
        return (
            <a
                className={'post__embed-visibility'}
                data-expanded={this.props.isEmbedVisible}
                aria-label='Toggle Embed Visibility'
                onClick={this.props.toggleEmbedVisibility}
            />
        );
    }

    renderLargeImage(imageUrl) {
        if (!this.props.isEmbedVisible) {
            return null;
        }

        const {images} = this.props.post.metadata;

        return (
            <SizeAwareImage
                className='attachment__image attachment__image--opengraph large_image'
                src={imageUrl}
                dimensions={images && images[imageUrl]}
            />
        );
    }

    renderSmallImage(imageUrl) {
        if (!this.props.isEmbedVisible) {
            return null;
        }

        const {images} = this.props.post.metadata;

        return (
            <div className='attachment__image__container--opengraph'>
                <SizeAwareImage
                    className='attachment__image attachment__image--opengraph'
                    src={imageUrl}
                    dimensions={images && images[imageUrl]}
                />
            </div>
        );
    }

    truncateText(text) {
        const maxLength = 300;
        const ellipsis = '...';

        if (text && text.length > maxLength) {
            return text.substring(0, maxLength - ellipsis.length) + ellipsis;
        }
        return text;
    }

    handleRemovePreview = async () => {
        const props = Object.assign({}, this.props.post.props);
        props[PostTypes.REMOVE_LINK_PREVIEW] = 'true';

        const patchedPost = ({
            id: this.props.post.id,
            props,
        });

        return this.props.actions.editPost(patchedPost);
    }

    hasPreviewBeenRemoved() {
        const {post} = this.props;

        if (!post || !post.props) {
            return false;
        }

        return post.props[PostTypes.REMOVE_LINK_PREVIEW] === 'true';
    }

    render() {
        if (!this.props.previewEnabled || !this.props.enableLinkPreviews) {
            return null;
        }

        if (!this.props.post || isSystemMessage(this.props.post)) {
            return null;
        }

        if (this.hasPreviewBeenRemoved()) {
            return null;
        }

        const data = this.props.openGraphData;
        if (!data) {
            return null;
        }

        const imageUrl = this.getBestImageUrl();
        const hasLargeImage = this.isLargeImage(imageUrl);

        let removePreviewButton;
        if (this.props.currentUserId === this.props.post.user_id) {
            removePreviewButton = (
                <button
                    id='removePreviewButton'
                    type='button'
                    className='btn-close'
                    aria-label='Close'
                    onClick={this.handleRemovePreview}
                >
                    <span aria-hidden='true'>{'×'}</span>
                </button>
            );
        }

        let body;
        if (data.description || imageUrl) {
            body = (
                <div className={'attachment__body attachment__body--opengraph'}>
                    <div>
                        {this.truncateText(data.description)}
                        {' '}
                        {imageUrl && hasLargeImage && this.renderImageToggle()}
                    </div>
                    {(imageUrl && hasLargeImage) && this.renderLargeImage(imageUrl)}
                </div>
            );
        }

        return (
            <div className='attachment attachment--opengraph'>
                <div className='attachment__content'>
                    <div className={'clearfix attachment__container attachment__container--opengraph'}>
                        <div className={'attachment__body__wrap attachment__body__wrap--opengraph'}>
                            <span className='sitename'>{this.truncateText(data.site_name)}</span>
                            {removePreviewButton}
                            <h1 className={'attachment__title attachment__title--opengraph' + (data.title ? '' : ' is-url')}>
                                <a
                                    className='attachment__title-link attachment__title-link--opengraph'
                                    href={useSafeUrl(data.url || this.props.link)}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    title={data.title || data.url || this.props.link}
                                >
                                    {this.truncateText(data.title || data.url || this.props.link)}
                                </a>
                            </h1>
                            {body}
                        </div>
                        {(imageUrl && !hasLargeImage) && this.renderSmallImage(imageUrl)}
                    </div>
                </div>
            </div>
        );
    }
}

export function getBestImageUrl(openGraphData, imagesMetadata, hasImageProxy) {
    if (!openGraphData || !openGraphData.images || openGraphData.images.length === 0) {
        return null;
    }

    // Get the dimensions from the post metadata if they weren't provided by the website as part of the OpenGraph data
    const images = openGraphData.images.map((image) => {
        const imageUrl = image.secure_url || image.url;

        if ((image.width && image.height) || !(imagesMetadata && imagesMetadata[imageUrl])) {
            // The image already includes dimensions or we don't have the missing dimensions
            return image;
        }

        return {
            ...image,
            height: image.height || imagesMetadata[imageUrl].height,
            width: image.width || imagesMetadata[imageUrl].width,
        };
    });

    const bestImage = getNearestPoint(DIMENSIONS_NEAREST_POINT_IMAGE, images, 'width', 'height');

    return getImageSrc(bestImage.secure_url || bestImage.url, hasImageProxy);
}
