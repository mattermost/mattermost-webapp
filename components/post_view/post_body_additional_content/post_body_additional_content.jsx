// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import MessageAttachmentList from 'components/post_view/message_attachments/message_attachment_list';
import PostAttachmentOpenGraph from 'components/post_view/post_attachment_opengraph';
import PostImage from 'components/post_view/post_image';
import YoutubeVideo from 'components/youtube_video';

export default class PostBodyAdditionalContent extends React.PureComponent {
    static propTypes = {

        /**
         * The post to render the content of
         */
        post: PropTypes.object.isRequired,

        /**
         * The post's message
         */
        children: PropTypes.element,

        /**
         * Flag passed down to PostBodyAdditionalContent for determining if post embed is visible
         */
        isEmbedVisible: PropTypes.bool,

        /**
         * Options specific to text formatting
         */
        options: PropTypes.object,

        actions: PropTypes.shape({
            toggleEmbedVisibility: PropTypes.func.isRequired,
        }).isRequired,
    }

    toggleEmbedVisibility = () => {
        this.props.actions.toggleEmbedVisibility(this.props.post.id);
    }

    getEmbed = () => {
        const {metadata} = this.props.post;
        if (!metadata || !metadata.embeds || metadata.embeds.length === 0) {
            return null;
        }

        return metadata.embeds[0];
    }

    isEmbedToggleable = (embed) => {
        return embed.type === 'image' || (embed.type === 'opengraph' && YoutubeVideo.isYoutubeLink(embed.url));
    }

    renderEmbed = (embed) => {
        switch (embed.type) {
        case 'image':
            return (
                <PostImage
                    imageMetadata={this.props.post.metadata.images[embed.url]}
                    link={embed.url}
                    post={this.props.post}
                />
            );

        case 'message_attachment': {
            let attachments = [];
            if (this.props.post.props && this.props.post.props.attachments) {
                attachments = this.props.post.props.attachments;
            }

            return (
                <MessageAttachmentList
                    attachments={attachments}
                    postId={this.props.post.id}
                    options={this.props.options}
                    imagesMetadata={this.props.post.metadata.images}
                />
            );
        }

        case 'opengraph':
            if (YoutubeVideo.isYoutubeLink(embed.url)) {
                return (
                    <YoutubeVideo
                        channelId={this.props.post.channel_id}
                        link={embed.url}
                        show={this.props.isEmbedVisible}
                    />
                );
            }

            return (
                <PostAttachmentOpenGraph
                    link={embed.url}
                    isEmbedVisible={this.props.isEmbedVisible}
                    post={this.props.post}
                    toggleEmbedVisibility={this.toggleEmbedVisibility}
                />
            );

        default:
            return null;
        }
    }

    renderToggle = (prependToggle) => {
        return (
            <a
                key='toggle'
                className={`post__embed-visibility ${prependToggle ? 'pull-left' : ''}`}
                data-expanded={this.props.isEmbedVisible}
                aria-label='Toggle Embed Visibility'
                onClick={this.toggleEmbedVisibility}
            />
        );
    }

    render() {
        const embed = this.getEmbed();

        if (embed) {
            const toggleable = this.isEmbedToggleable(embed);
            const prependToggle = (/^\s*https?:\/\/.*$/).test(this.props.post.message);

            return (
                <div>
                    {(toggleable && prependToggle) && this.renderToggle(true)}
                    {this.props.children}
                    {(toggleable && !prependToggle) && this.renderToggle(false)}
                    {this.props.isEmbedVisible && this.renderEmbed(embed)}
                </div>
            );
        }

        return this.props.children;
    }
}
