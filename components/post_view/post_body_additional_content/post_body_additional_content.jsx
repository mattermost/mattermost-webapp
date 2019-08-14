// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as Utils from 'utils/utils.jsx';
import YoutubeVideo from 'components/youtube_video';
import ViewImageModal from 'components/view_image';
import Constants from 'utils/constants';
import * as PostUtils from 'utils/post_utils.jsx';

import MessageAttachmentList from '../message_attachments/message_attachment_list.jsx';
import PostAttachmentOpenGraph from '../post_attachment_opengraph';
import PostImage from '../post_image';

export default class PostBodyAdditionalContent extends React.PureComponent {
    static propTypes = {

        /**
         * The post to render the content of
         */
        post: PropTypes.object.isRequired,

        /**
         * The post's message
         */
        children: PropTypes.element.isRequired,

        /**
         * User's preference to link previews
         */
        previewEnabled: PropTypes.bool,

        /**
         * Flag passed down to PostBodyAdditionalContent for determining if post embed is visible
         */
        isEmbedVisible: PropTypes.bool,

        /**
         * Whether link previews are enabled in the first place.
         */
        enableLinkPreviews: PropTypes.bool.isRequired,

        /**
         * If an image proxy is enabled.
         */
        hasImageProxy: PropTypes.bool.isRequired,

        /**
         * Options specific to text formatting
         */
        options: PropTypes.object,

        actions: PropTypes.shape({
            getRedirectLocation: PropTypes.func.isRequired,
            toggleEmbedVisibility: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        previewEnabled: false,
    }

    constructor(props) {
        super(props);

        this.getSlackAttachment = this.getSlackAttachment.bind(this);
        this.generateToggleableEmbed = this.generateToggleableEmbed.bind(this);
        this.generateStaticEmbed = this.generateStaticEmbed.bind(this);
        this.isLinkToggleable = this.isLinkToggleable.bind(this);
        this.handleLinkLoadError = this.handleLinkLoadError.bind(this);
        this.handleLinkLoaded = this.handleLinkLoaded.bind(this);

        this.state = {
            link: Utils.extractFirstLink(props.post.message),
            linkLoadError: false,
            linkLoaded: false,
        };
    }

    componentDidMount() {
        // check the availability of the image rendered(if any) in the first render.
        this.loadShortenedImageLink();
        this.preCheckImageLink();
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    async loadShortenedImageLink() {
        if (!this.isLinkImage(this.state.link) && !YoutubeVideo.isYoutubeLink(this.state.link) && this.props.enableLinkPreviews) {
            const {data} = await this.props.actions.getRedirectLocation(this.state.link);
            const {link} = this.state;
            if (data && data.location && this.mounted) {
                this.setState((state) => {
                    if (state.link !== link) {
                        return {};
                    }
                    return {link: data.location};
                });
                this.preCheckImageLink();
            }
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.post.message !== this.props.post.message) {
            this.setState({
                link: Utils.extractFirstLink(nextProps.post.message),
            }, () => {
                // check the availability of the image link
                this.loadShortenedImageLink();
                this.preCheckImageLink();
            });
        }
    }

    toggleEmbedVisibility = () => {
        this.props.actions.toggleEmbedVisibility(this.props.post.id);
    }

    getSlackAttachment() {
        let attachments = [];
        if (this.props.post.props && this.props.post.props.attachments) {
            attachments = this.props.post.props.attachments;
        }

        return (
            <MessageAttachmentList
                attachments={attachments}
                postId={this.props.post.id}
                key={this.props.post.id}
                options={this.props.options}
                imagesMetadata={this.props.post.metadata && this.props.post.metadata.images}
            />
        );
    }

    // when image links are collapsed, check if the link is a valid image url and it is available
    preCheckImageLink() {
        // check only if embedVisible is false i.e the image are by default hidden/collapsed
        // if embedVisible is true, the image is rendered, during which image load error is captured
        if (!this.props.isEmbedVisible && this.isLinkImage(this.state.link)) {
            const image = new Image();
            image.src = PostUtils.getImageSrc(this.state.link, this.props.hasImageProxy);

            image.onload = () => {
                this.handleLinkLoaded();
            };

            image.onerror = () => {
                this.handleLinkLoadError();
            };
        }
    }

    isLinkImage(link) {
        let linkWithoutQuery = link.toLowerCase();
        if (link.indexOf('?') !== -1) {
            linkWithoutQuery = linkWithoutQuery.split('?')[0];
        }

        for (let i = 0; i < Constants.IMAGE_TYPES.length; i++) {
            const imageType = Constants.IMAGE_TYPES[i];

            if (linkWithoutQuery.endsWith('.' + imageType) || linkWithoutQuery.endsWith('=' + imageType)) {
                return true;
            }
        }

        return false;
    }

    isLinkToggleable() {
        const link = this.state.link;
        if (!link) {
            return false;
        }

        if (YoutubeVideo.isYoutubeLink(link)) {
            return true;
        }

        if (this.isLinkImage(link)) {
            return true;
        }

        return false;
    }

    handleLinkLoadError() {
        if (this.mounted) {
            this.setState({
                linkLoadError: true,
            });
        }
    }

    handleLinkLoaded() {
        if (this.mounted) {
            this.setState({
                linkLoaded: true,
            });
        }
    }

    handleImageClick = () => {
        this.setState({
            showPreviewModal: true,
        });
    };

    generateToggleableEmbed() {
        const link = this.state.link;
        if (!link) {
            return null;
        }

        if (YoutubeVideo.isYoutubeLink(link)) {
            return (
                <YoutubeVideo
                    channelId={this.props.post.channel_id}
                    link={link}
                    show={this.props.isEmbedVisible}
                    onLinkLoaded={this.handleLinkLoaded}
                />
            );
        }

        if (this.isLinkImage(link)) {
            const imageMetadata = this.props.post.metadata && this.props.post.metadata.images && this.props.post.metadata.images[link];
            return (
                <PostImage
                    channelId={this.props.post.channel_id}
                    link={link}
                    onLinkLoadError={this.handleLinkLoadError}
                    onLinkLoaded={this.handleLinkLoaded}
                    handleImageClick={this.handleImageClick}
                    imageMetadata={imageMetadata}
                />
            );
        }

        return null;
    }

    generateStaticEmbed() {
        if (this.props.post.props && this.props.post.props.attachments) {
            return this.getSlackAttachment();
        }

        const link = Utils.extractFirstLink(this.props.post.message);
        if (link && this.props.enableLinkPreviews && this.props.previewEnabled) {
            return (
                <PostAttachmentOpenGraph
                    link={link}
                    isEmbedVisible={this.props.isEmbedVisible}
                    post={this.props.post}
                    toggleEmbedVisibility={this.toggleEmbedVisibility}
                />
            );
        }

        return null;
    }

    renderImagePreview() {
        let link = this.state.link;
        if (!link || !this.isLinkImage(link)) {
            return null;
        }

        const captureExt = /(?:\.([^.]+))?$/;
        if (!captureExt || captureExt.length <= 1) {
            return null;
        }

        const ext = captureExt.exec(link)[1];

        link = PostUtils.getImageSrc(link, this.props.hasImageProxy);

        return (
            <ViewImageModal
                show={this.state.showPreviewModal}
                onModalDismissed={() => this.setState({showPreviewModal: false})}
                startIndex={0}
                fileInfos={[{
                    has_preview_image: false,
                    link,
                    extension: ext,
                }]}
            />
        );
    }

    render() {
        if (this.isLinkToggleable() && !this.state.linkLoadError) {
            // if message has only one line and starts with a link place toggle in this only line
            // else - place it in new line between message and embed
            const prependToggle = (/^\s*https?:\/\/.*$/).test(this.props.post.message);

            const toggle = (
                <a
                    key='toggle'
                    className={`post__embed-visibility ${prependToggle ? 'pull-left' : ''}`}
                    data-expanded={this.props.isEmbedVisible}
                    aria-label='Toggle Embed Visibility'
                    onClick={this.toggleEmbedVisibility}
                />
            );
            const message = (
                <div key='message'>
                    {this.props.children}
                </div>
            );

            const contents = [message];

            if (this.state.linkLoaded || YoutubeVideo.isYoutubeLink(this.state.link)) {
                if (prependToggle) {
                    contents.unshift(toggle);
                } else {
                    contents.push(toggle);
                }
            }

            if (this.props.isEmbedVisible) {
                contents.push(
                    <div
                        key='embed'
                        className='post__embed-container'
                    >
                        {this.generateToggleableEmbed()}
                    </div>
                );
            }
            const imagePreview = this.renderImagePreview();

            return (
                <div>
                    {contents}
                    {imagePreview}
                </div>
            );
        }

        const staticEmbed = this.generateStaticEmbed();

        if (staticEmbed) {
            return (
                <div>
                    {this.props.children}
                    {staticEmbed}
                </div>
            );
        }

        return this.props.children;
    }
}
