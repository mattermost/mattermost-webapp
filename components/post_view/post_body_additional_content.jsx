// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import BrowserStore from 'stores/browser_store.jsx';

import * as Utils from 'utils/utils.jsx';
import {StoragePrefixes} from 'utils/constants.jsx';

import YoutubeVideo from 'components/youtube_video';
import ViewImageModal from 'components/view_image';

import PostAttachmentList from './post_attachment_list.jsx';
import PostAttachmentOpenGraph from './post_attachment_opengraph';
import PostImage from './post_image.jsx';

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
         * Set to collapse image and video previews
         */
        previewCollapsed: PropTypes.string,

        /**
         * User's preference to link previews
         */
        previewEnabled: PropTypes.bool,

        /**
         * Flag passed down to PostBodyAdditionalContent for determining if post embed is visible
         */
        isEmbedVisible: PropTypes.bool
    }

    static defaultProps = {
        previewCollapsed: '',
        previewEnabled: false
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
            linkLoaded: false
        };
    }

    componentDidMount() {
        // check the availability of the image rendered(if any) in the first render.
        this.preCheckImageLink();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.post.message !== this.props.post.message) {
            this.setState({
                link: Utils.extractFirstLink(nextProps.post.message)
            }, () => {
                // check the availability of the image link
                this.preCheckImageLink();
            });
        }
    }

    toggleEmbedVisibility = () => {
        // save the taggle info in the localstorage
        BrowserStore.setGlobalItem(StoragePrefixes.EMBED_VISIBLE + this.props.post.id, !this.props.isEmbedVisible);
    }

    getSlackAttachment() {
        let attachments = [];
        if (this.props.post.props && this.props.post.props.attachments) {
            attachments = this.props.post.props.attachments;
        }

        return (
            <PostAttachmentList
                attachments={attachments}
                postId={this.props.post.id}
                key={this.props.post.id}
            />
        );
    }

    // when image links are collapsed, check if the link is a valid image url and it is available
    preCheckImageLink() {
        // check only if embedVisible is false i.e the image are by default hidden/collapsed
        // if embedVisible is true, the image is rendered, during which image load error is captured
        if (!this.props.isEmbedVisible && this.isLinkImage(this.state.link)) {
            const image = new Image();
            image.src = this.state.link;

            image.onload = () => {
                this.handleLinkLoaded();
            };

            image.onerror = () => {
                this.handleLinkLoadError();
            };
        }
    }

    isLinkImage(link) {
        const regex = /.+\/(.+\.(?:jpg|gif|bmp|png|jpeg))(?:\?.*)?$/i;
        const match = link.match(regex);
        if (match && match[1]) {
            return true;
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
        this.setState({
            linkLoadError: true
        });
    }

    handleLinkLoaded() {
        this.setState({
            linkLoaded: true
        });
    }

    handleImageClick = () => {
        this.setState({
            showPreviewModal: true
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
            return (
                <PostImage
                    channelId={this.props.post.channel_id}
                    link={link}
                    onLinkLoadError={this.handleLinkLoadError}
                    onLinkLoaded={this.handleLinkLoaded}
                    handleImageClick={this.handleImageClick}
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
        if (link && global.window.mm_config.EnableLinkPreviews === 'true' && this.props.previewEnabled) {
            return (
                <PostAttachmentOpenGraph
                    link={link}
                    previewCollapsed={this.props.previewCollapsed}
                    post={this.props.post}
                />
            );
        }

        return null;
    }

    renderImagePreview() {
        const link = this.state.link;
        if (!link || !this.isLinkImage(link)) {
            return null;
        }

        const captureExt = /(?:\.([^.]+))?$/;
        if (!captureExt || captureExt.length <= 1) {
            return null;
        }

        const ext = captureExt.exec(link)[1];

        return (
            <ViewImageModal
                show={this.state.showPreviewModal}
                onModalDismissed={() => this.setState({showPreviewModal: false})}
                startIndex={0}
                fileInfos={[{
                    hasPreviewImage: false,
                    link,
                    extension: ext
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
