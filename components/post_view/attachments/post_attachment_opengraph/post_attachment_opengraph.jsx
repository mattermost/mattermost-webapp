// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {postListScrollChange} from 'actions/global_actions.jsx';
import {updatePost} from 'actions/post_actions.jsx';
import * as CommonUtils from 'utils/commons.jsx';
import {PostTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import {
    AttachmentContainer,
    AttachmentContentContainer,
    AttachmentContentLeft,
    AttachmentDescription,
    AttachmentSiteName,
    AttachmentTitle, ImageLarge,
    ImageThumbnail,
    RemovePreviewButton
} from 'components/post_view/attachments/attachment_styles';
import {useSafeUrl} from 'utils/url';

const LARGE_IMAGE_MIN_WIDTH = 150;
const IMAGE_DIMENSIONS = {
    height: 80,
    width: 80
};
const TEXT_MAX_LENGTH = 250;
const TEXT_ELLIPSIS = '...';
const IMAGE_LOADED = {
    LOADING: 'loading',
    YES: 'yes',
    ERROR: 'error'
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
         * Set to collapse the preview
         */
        previewCollapsed: PropTypes.string,
        actions: PropTypes.shape({

            /**
             * The function to get open graph data for a link
             */
            getOpenGraphMetadata: PropTypes.func.isRequired
        }).isRequired
    }

    constructor(props) {
        super(props);
        this.state = {};
        this.largeImageMinRatio = 16 / 9;
        this.imageRatio = null;
    }

    componentWillMount() {
        const removePreview = this.isRemovePreview(this.props.post, this.props.currentUser);

        this.setState({
            imageLoaded: IMAGE_LOADED.LOADING,
            imageVisible: this.props.previewCollapsed.startsWith('false'),
            hasLargeImage: false,
            removePreview
        });
        this.fetchData(this.props.link);
    }

    componentWillReceiveProps(nextProps) {
        if (!Utils.areObjectsEqual(nextProps.post, this.props.post)) {
            const removePreview = this.isRemovePreview(nextProps.post, nextProps.currentUser);
            this.setState({
                removePreview
            });
        }
        if (nextProps.link !== this.props.link) {
            this.fetchData(nextProps.link);
        }
        if (nextProps.previewCollapsed !== this.props.previewCollapsed) {
            this.setState({
                imageVisible: nextProps.previewCollapsed.startsWith('false')
            });
        }
    }

    componentDidUpdate() {
        setTimeout(postListScrollChange, 0);
    }

    fetchData = (url) => {
        if (!this.props.openGraphData) {
            this.props.actions.getOpenGraphMetadata(url);
        }
    }

    getBestImageUrl(data) {
        if (Utils.isEmptyObject(data.images)) {
            return null;
        }
        const bestImage = CommonUtils.getNearestPoint(IMAGE_DIMENSIONS, data.images, 'width', 'height');
        return bestImage.secure_url || bestImage.url;
    }

    toggleImageVisibility = () => {
        this.setState({imageVisible: !this.state.imageVisible});
    }

    onImageLoad = (image) => {
        this.imageRatio = image.target.naturalWidth / image.target.naturalHeight;
        if (
            image.target.naturalWidth >= LARGE_IMAGE_MIN_WIDTH &&
            this.imageRatio >= this.largeImageMinRatio &&
            !this.state.hasLargeImage
        ) {
            this.setState({
                hasLargeImage: true
            });
        }
        this.setState({
            imageLoaded: IMAGE_LOADED.YES
        });
    }

    onImageError = () => {
        this.setState({imageLoaded: IMAGE_LOADED.ERROR});
    }

    loadImage(src) {
        const img = new Image();
        img.onload = this.onImageLoad;
        img.onerror = this.onImageError;
        img.src = src;
    }

    imageToggleAnchoreTag(imageUrl) {
        if (imageUrl && this.state.hasLargeImage) {
            return (
                <a
                    className={'post__embed-visibility'}
                    data-expanded={this.state.imageVisible}
                    aria-label='Toggle Embed Visibility'
                    onClick={this.toggleImageVisibility}
                />
            );
        }
        return null;
    }

    imageTag(imageUrl, renderingForLargeImage = false) {
        if (
            imageUrl && renderingForLargeImage === this.state.hasLargeImage &&
            (!renderingForLargeImage || (renderingForLargeImage && this.state.imageVisible))
        ) {
            if (this.state.imageLoaded === IMAGE_LOADED.LOADING) {
                if (renderingForLargeImage) {
                    return <ImageLarge/>;
                }
                return (
                    <ImageThumbnail/>
                );
            } else if (this.state.imageLoaded === IMAGE_LOADED.YES) {
                if (renderingForLargeImage) {
                    return (
                        <ImageLarge
                            src={imageUrl}
                        />
                    );
                }
                return (
                    <ImageThumbnail
                        src={imageUrl}
                    />
                );
            }
        }
        return null;
    }

    truncateText(text, maxLength = TEXT_MAX_LENGTH, ellipsis = TEXT_ELLIPSIS) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength - ellipsis.length) + ellipsis;
        }
        return text;
    }

    handleRemovePreview = () => {
        const props = Object.assign({}, this.props.post.props);
        props[PostTypes.REMOVE_LINK_PREVIEW] = 'true';

        const patchedPost = ({
            id: this.props.post.id,
            props
        });

        updatePost(patchedPost, () => {
            this.setState({removePreview: true});
        });
    }

    isRemovePreview(post, currentUser) {
        if (post && post.props && currentUser.id === post.user_id) {
            return post.props[PostTypes.REMOVE_LINK_PREVIEW] && post.props[PostTypes.REMOVE_LINK_PREVIEW] === 'true';
        }

        return false;
    }
    removePreviewButton() {
        if (this.props.currentUser.id === this.props.post.user_id) {
            return (
                <RemovePreviewButton
                    id='removePreviewButton'
                    type='button'
                    className='btn-close'
                    aria-label='Close'
                    onClick={this.handleRemovePreview}
                >
                    <span aria-hidden='true'>{'×'}</span>
                </RemovePreviewButton>
            );
        }
        return null;
    }

    render() {
        // debugger;
        const data = this.props.openGraphData;
        if (this.state.removePreview) {
            return null;
        }
        if (!data || Utils.isEmptyObject(data.description)) {
            return (
                <AttachmentContainer>
                    <AttachmentContentContainer/>
                </AttachmentContainer>
            );
        }

        const imageUrl = this.getBestImageUrl(data);
        if (imageUrl) {
            this.loadImage(imageUrl);
        }

        return (
            <AttachmentContainer>
                {this.removePreviewButton()}
                <AttachmentContentContainer
                    className='bs4-d-flex bs4-align-items-stretch'
                >
                    <AttachmentContentLeft>
                        <AttachmentSiteName>
                            {this.truncateText(data.site_name)}
                        </AttachmentSiteName>
                        <AttachmentTitle>
                            <a
                                href={useSafeUrl(data.url || this.props.link)}
                                target='_blank'
                                rel='noopener noreferrer'
                                title={data.title || data.url || this.props.link}
                            >
                                {this.truncateText(data.title || data.url || this.props.link)}
                            </a>
                        </AttachmentTitle>
                        <AttachmentDescription>
                            {this.truncateText(data.description)}
                            {this.imageToggleAnchoreTag(imageUrl)}
                        </AttachmentDescription>
                        {this.imageTag(imageUrl, true)}
                    </AttachmentContentLeft>
                    <div className='bs4-ml-auto'>
                        {this.imageTag(imageUrl, false)}
                    </div>
                </AttachmentContentContainer>
            </AttachmentContainer>
        );
    }
}
