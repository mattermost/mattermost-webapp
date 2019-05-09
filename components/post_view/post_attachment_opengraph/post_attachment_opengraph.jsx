// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SizeAwareImage from 'components/size_aware_image';
import * as CommonUtils from 'utils/commons.jsx';
import {PostTypes} from 'utils/constants.jsx';
import {useSafeUrl} from 'utils/url';
import * as Utils from 'utils/utils.jsx';
import {getImageSrc, isSystemMessage} from 'utils/post_utils.jsx';

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
         * The current user viewing the post
         */
        currentUser: PropTypes.object,

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

        isEmbedVisible: PropTypes.bool,
        toggleEmbedVisibility: PropTypes.func.isRequired,

        actions: PropTypes.shape({
            editPost: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        const removePreview = this.isRemovePreview(props.post, props.currentUser);
        const imageUrl = PostAttachmentOpenGraph.getBestImageUrl(props.openGraphData, props.hasImageProxy);
        const {images} = props.post.metadata;
        const hasLargeImage = images && images[imageUrl] && imageUrl ? this.hasLargeImage(images[imageUrl]) : false;

        this.state = {
            hasLargeImage,
            removePreview,
            imageUrl,
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (!Utils.areObjectsEqual(nextProps.post, this.props.post)) {
            const removePreview = this.isRemovePreview(nextProps.post, nextProps.currentUser);
            this.setState({
                removePreview,
            });
        }

        if (!Utils.areObjectsEqual(nextProps.openGraphData, this.props.openGraphData)) {
            const imageUrl = PostAttachmentOpenGraph.getBestImageUrl(nextProps.openGraphData, nextProps.hasImageProxy);
            const {images} = nextProps.post.metadata;
            const hasLargeImage = images && images[imageUrl] && imageUrl ? this.hasLargeImage(images[imageUrl]) : false;

            this.setState({
                hasLargeImage,
                imageUrl,
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    hasLargeImage({height, width}) {
        let hasLargeImage;
        const largeImageMinRatio = 16 / 9;
        const largeImageMinWidth = 150;

        const imageRatio = width / height;
        if (width >= largeImageMinWidth && imageRatio >= largeImageMinRatio) {
            hasLargeImage = true;
        } else {
            hasLargeImage = false;
        }

        return hasLargeImage;
    }

    onImageLoad = ({width, height}) => {
        if (!this.mounted) {
            return;
        }

        const hasLargeImage = this.hasLargeImage({width, height});

        this.setState({
            hasLargeImage,
        });
    }

    imageToggleAnchorTag(imageUrl) {
        if (imageUrl && this.state.hasLargeImage) {
            return (
                <a
                    className={'post__embed-visibility'}
                    data-expanded={this.props.isEmbedVisible}
                    aria-label='Toggle Embed Visibility'
                    onClick={this.props.toggleEmbedVisibility}
                />
            );
        }
        return null;
    }

    loadLargeImage(imageUrl) {
        if (imageUrl && this.props.isEmbedVisible && this.state.hasLargeImage) {
            const {images} = this.props.post.metadata;
            let imagesDimensions = null;
            if (images && images[imageUrl]) {
                imagesDimensions = images[imageUrl];
            }
            return (
                <SizeAwareImage
                    className='attachment__image attachment__image--opengraph large_image'
                    src={imageUrl}
                    dimensions={imagesDimensions}
                    onImageLoaded={this.onImageLoad}
                />
            );
        }
        return null;
    }

    loadSmallImage(imageUrl) {
        if (imageUrl && !this.state.hasLargeImage) {
            const {images} = this.props.post.metadata;
            let imagesDimensions = null;
            if (images && images[imageUrl]) {
                imagesDimensions = images[imageUrl];
            }
            return (
                <div className='attachment__image__container--opengraph'>
                    <SizeAwareImage
                        className='attachment__image attachment__image--opengraph'
                        src={imageUrl}
                        dimensions={imagesDimensions}
                        onImageLoaded={this.onImageLoad}
                    />
                </div>
            );
        }
        return null;
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

        const {data} = await this.props.actions.editPost(patchedPost);
        if (data) {
            if (this.mounted) {
                this.setState({removePreview: true});
            }
        }
    }

    isRemovePreview(post) {
        if (post && post.props) {
            return post.props[PostTypes.REMOVE_LINK_PREVIEW] && post.props[PostTypes.REMOVE_LINK_PREVIEW] === 'true';
        }

        return false;
    }

    render() {
        if (!this.props.previewEnabled || !this.props.enableLinkPreviews) {
            return null;
        }

        if (!this.props.post || isSystemMessage(this.props.post)) {
            return null;
        }

        if (this.state.removePreview) {
            return null;
        }

        const data = this.props.openGraphData;
        if (!data) {
            return null;
        }

        let removePreviewButton;
        if (this.props.currentUser.id === this.props.post.user_id) {
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
        const {imageUrl} = this.state;

        let body;
        if (data.description || imageUrl) {
            body = (
                <React.Fragment>
                    <div className={'attachment__body attachment__body--opengraph'}>
                        <div>
                            <div>
                                {this.truncateText(data.description)}
                                {' '}
                                {this.imageToggleAnchorTag(imageUrl)}
                            </div>
                            {this.loadLargeImage(imageUrl)}
                        </div>
                    </div>
                </React.Fragment>
            );
        }

        return (
            <div
                className='attachment attachment--opengraph'
                ref='attachment'
            >
                <div className='attachment__content'>
                    <div
                        className={'clearfix attachment__container attachment__container--opengraph'}
                    >
                        <div
                            className={'attachment__body__wrap attachment__body__wrap--opengraph'}
                        >
                            <span className='sitename'>{this.truncateText(data.site_name)}</span>
                            {removePreviewButton}
                            <h1
                                className={'attachment__title attachment__title--opengraph' + (data.title ? '' : ' is-url')}
                            >
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
                        {this.loadSmallImage(imageUrl)}
                    </div>
                </div>
            </div>
        );
    }

    static getBestImageUrl(data, hasImageProxy) {
        if (!data || !data.images || data.images.length === 0) {
            return null;
        }

        const bestImage = CommonUtils.getNearestPoint(DIMENSIONS_NEAREST_POINT_IMAGE, data.images, 'width', 'height');

        return getImageSrc(bestImage.secure_url || bestImage.url, hasImageProxy);
    }
}
