// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Markdown from 'components/markdown';

import {renderSystemMessage} from './system_message_helpers.jsx';

export default class PostMarkdown extends React.PureComponent {
    static propTypes = {

        /*
         * Any extra props that should be passed into the image component
         */
        imageProps: PropTypes.object,

        /*
         * Whether or not this text is part of the RHS
         */
        isRHS: PropTypes.bool,

        /*
         * The post text to be rendered
         */
        message: PropTypes.string.isRequired,

        /*
         * The optional post for which this message is being rendered
         */
        post: PropTypes.object,

        /*
         * The id of the channel that this post is being rendered in
         */
        channelId: PropTypes.string,

        channel: PropTypes.object,

        options: PropTypes.object,

        pluginHooks: PropTypes.arrayOf(PropTypes.object),

        /**
         * Whether or not to place the LinkTooltip component inside links
         */
        hasPluginTooltips: PropTypes.bool,

        isUserCanManageMembers: PropTypes.bool,
        mentionKeys: PropTypes.array.isRequired,
    };

    static defaultProps = {
        isRHS: false,
        pluginHooks: [],
        options: {},
    };

    render() {
        let {message} = this.props;
        const {post, mentionKeys} = this.props;

        if (post) {
            const renderedSystemMessage = renderSystemMessage(post, this.props.channel, this.props.isUserCanManageMembers);
            if (renderedSystemMessage) {
                return <div>{renderedSystemMessage}</div>;
            }
        }

        // Proxy images if we have an image proxy and the server hasn't already rewritten the post's image URLs.
        const proxyImages = !post || !post.message_source || post.message === post.message_source;
        const channelNamesMap = post && post.props && post.props.channel_mentions;
        const options = {
            ...this.props.options,
            disableGroupHighlight: post?.props?.disable_group_highlight === true, // eslint-disable-line camelcase
        };

        this.props.pluginHooks.forEach((o) => {
            if (o && o.hook && post) {
                message = o.hook(post, message);
            }
        });

        if (post && post.props) {
            options.mentionHighlight = !post.props.mentionHighlightDisabled;
        }

        return (
            <Markdown
                imageProps={this.props.imageProps}
                isRHS={this.props.isRHS}
                message={message}
                proxyImages={proxyImages}
                mentionKeys={mentionKeys}
                options={options}
                channelNamesMap={channelNamesMap}
                hasPluginTooltips={this.props.hasPluginTooltips}
                imagesMetadata={this.props.post && this.props.post.metadata && this.props.post.metadata.images}
                postId={this.props.post && this.props.post.id}
            />
        );
    }
}
