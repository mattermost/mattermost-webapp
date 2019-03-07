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
        channel: PropTypes.object,

        options: PropTypes.object,

        pluginHooks: PropTypes.arrayOf(PropTypes.object),

        /**
         * Whether or not to place the LinkTooltip component inside links
         */
        hasPluginTooltips: PropTypes.bool,
    };

    static defaultProps = {
        isRHS: false,
        pluginHooks: [],
    };

    render() {
        if (this.props.post) {
            const renderedSystemMessage = renderSystemMessage(this.props.post, this.props.channel);
            if (renderedSystemMessage) {
                return <div>{renderedSystemMessage}</div>;
            }
        }

        // Proxy images if we have an image proxy and the server hasn't already rewritten the post's image URLs.
        const proxyImages = !this.props.post || !this.props.post.message_source || this.props.post.message === this.props.post.message_source;
        const channelNamesMap = this.props.post && this.props.post.props && this.props.post.props.channel_mentions;

        let {message} = this.props;
        const {post} = this.props;

        this.props.pluginHooks.forEach((o) => {
            if (o && o.hook && post) {
                message = o.hook(post, message);
            }
        });

        return (
            <Markdown
                imageProps={this.props.imageProps}
                isRHS={this.props.isRHS}
                message={message}
                proxyImages={proxyImages}
                options={this.props.options}
                channelNamesMap={channelNamesMap}
                hasPluginTooltips={this.props.hasPluginTooltips}
                imagesMetadata={this.props.post && this.props.post.metadata && this.props.post.metadata.images}
            />
        );
    }
}
