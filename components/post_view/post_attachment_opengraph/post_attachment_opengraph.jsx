// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {postListScrollChange} from 'actions/global_actions.jsx';
import * as CommonUtils from 'utils/commons.jsx';
import {PostTypes} from 'utils/constants.jsx';
import {useSafeUrl} from 'utils/url';
import * as Utils from 'utils/utils.jsx';
import {isSystemMessage} from 'utils/post_utils.jsx';
import {getFileDimensionsForDisplay} from 'utils/file_utils';

const MAX_DIMENSIONS_LARGE_IMAGE = {
    maxHeight: 200,
    maxWidth: 400,
};

const MAX_DIMENSIONS_SMALL_IMAGE = {
    maxHeight: 80,
    maxWidth: 95,
};

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

        isEmbedVisible: PropTypes.bool,
        toggleEmbedVisibility: PropTypes.func.isRequired,

        actions: PropTypes.shape({
            editPost: PropTypes.func.isRequired,

            /**
             * The function to get open graph data for a link
             */
            getOpenGraphMetadata: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        const removePreview = this.isRemovePreview(props.post, props.currentUser);
        const imageUrl = this.getBestImageUrl(props.openGraphData);
        const {metadata} = props.post;
        const hasLargeImage = metadata && metadata.images && metadata.images[imageUrl] && imageUrl ? this.hasLargeImage(metadata.images[imageUrl]) : false;

        if (!props.post.metadata && imageUrl) {
            this.loadImage(imageUrl);
        }

        this.state = {
            imageLoaded: false,
            hasLargeImage,
            removePreview,
            imageUrl,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (!Utils.areObjectsEqual(nextProps.post, this.props.post)) {
            const removePreview = this.isRemovePreview(nextProps.post, nextProps.currentUser);
            const imageUrl = this.getBestImageUrl(nextProps.openGraphData);
            const {metadata} = nextProps.post;
            const hasLargeImage = metadata && metadata.images && metadata.images[imageUrl] && imageUrl ? this.hasLargeImage(metadata.images[imageUrl]) : false;
            if (!nextProps.post.metadata && imageUrl) {
                this.loadImage(imageUrl);
            }

            this.setState({
                hasLargeImage,
                removePreview,
                imageUrl,
            });
        }
        if (nextProps.link !== this.props.link && !nextProps.post.metadata) {
            this.fetchData(nextProps.link);
        }
    }

    componentDidUpdate() {
        setTimeout(postListScrollChange, 0);
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        const removePreview = this.isRemovePreview(this.props.post, this.props.currentUser);
        if (!this.props.post.metadata) {
            this.setState({
                imageLoaded: false,
                hasLargeImage: false,
            });

            this.fetchData(this.props.link);
        }
        this.setState({
            removePreview,
        });
    }

    fetchData = (url) => {
        if (!this.props.openGraphData) {
            this.props.actions.getOpenGraphMetadata(url);
        }
    }

    getBestImageUrl(data) {
        if (!data || Utils.isEmptyObject(data.images)) {
            return null;
        }

        const bestImage = CommonUtils.getNearestPoint(DIMENSIONS_NEAREST_POINT_IMAGE, data.images, 'width', 'height');
        return bestImage.secure_url || bestImage.url;
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

    onImageLoad = (image) => {
        this.imageRatio = image.target.naturalWidth / image.target.naturalHeight;
        if (
            image.target.naturalWidth >= this.largeImageMinWidth &&
           this.imageRatio >= this.largeImageMinRatio &&
           !this.state.hasLargeImage
        ) {
            this.setState({
                hasLargeImage: true,
            });
        }
        this.setState({
            imageLoaded: true,
        });
    }

    loadImage(src) {
        const img = new Image();
        img.onload = this.onImageLoad;
        img.src = src;
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

    wrapInSmallImageContainer(imageElement) {
        return (
            <div className='attachment__image__container--opengraph'>
                {imageElement}
            </div>
        );
    }

    imageTag(imageUrl, renderingForLargeImage = false) {
        let element = null;
        const {metadata} = this.props.post;
        if (!metadata) {
            return element;
        }

        if (
            imageUrl && renderingForLargeImage === this.state.hasLargeImage &&
            (!renderingForLargeImage || (renderingForLargeImage && this.props.isEmbedVisible))
        ) {
            if (this.props.post.metadata || (!this.props.post.metadata && this.state.imageLoaded)) {
                if (renderingForLargeImage) {
                    const imageDimensions = getFileDimensionsForDisplay(metadata.images && metadata.images[imageUrl], MAX_DIMENSIONS_LARGE_IMAGE);

                    element = (
                        <img
                            className={'attachment__image attachment__image--opengraph large_image'}
                            src={imageUrl}
                            {...imageDimensions}
                        />
                    );
                } else {
                    const imageDimensions = getFileDimensionsForDisplay(metadata.images && metadata.images[imageUrl], MAX_DIMENSIONS_SMALL_IMAGE);
                    element = this.wrapInSmallImageContainer(
                        <img
                            className={'attachment__image attachment__image--opengraph'}
                            src={imageUrl}
                            {...imageDimensions}
                        />
                    );
                }
            } else if (!this.state.imageLoaded) {
                if (renderingForLargeImage) {
                    element = <img className={'attachment__image attachment__image--opengraph loading large_image'}/>;
                } else {
                    element = this.wrapInSmallImageContainer(
                        <img className={'attachment__image attachment__image--opengraph loading '}/>
                    );
                }
            }
        }
        return element;
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
            this.setState({removePreview: true});
        }
    }

    isRemovePreview(post) {
        if (post && post.props) {
            return post.props[PostTypes.REMOVE_LINK_PREVIEW] && post.props[PostTypes.REMOVE_LINK_PREVIEW] === 'true';
        }

        return false;
    }

    render() {
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
                            {this.imageTag(imageUrl, true)}
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
                        {this.imageTag(imageUrl, false)}
                    </div>
                </div>
            </div>
        );
    }
}
