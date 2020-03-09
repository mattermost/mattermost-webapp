// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import messageHtmlToComponent from 'utils/message_html_to_component';
import * as TextFormatting from 'utils/text_formatting';

export default class Markdown extends React.PureComponent {
    static propTypes = {

        /*
         * An object mapping channel names to channels for the current team
         */
        channelNamesMap: PropTypes.object,

        /*
         * An array of URL schemes that should be turned into links. Anything that looks
         * like a link will be turned into a link if this is not provided.
         */
        autolinkedUrlSchemes: PropTypes.array,

        /*
         * Whether or not to do Markdown rendering
         */
        enableFormatting: PropTypes.bool,

        /*
         * Whether or not this text is part of the RHS
         */
        isRHS: PropTypes.bool,

        /*
         * An array of words that can be used to mention a user
         */
        mentionKeys: PropTypes.arrayOf(PropTypes.object),

        /*
         * The text to be rendered
         */
        message: PropTypes.string.isRequired,

        /*
         * Any additional text formatting options to be used
         */
        options: PropTypes.object,

        /*
         * The root Site URL for the page
         */
        siteURL: PropTypes.string,

        /*
         * The current team
         */
        team: PropTypes.object,

        /**
         * If an image proxy is enabled.
         */
        hasImageProxy: PropTypes.bool,

        /**
         * Minimum number of characters in a hashtag.
         */
        minimumHashtagLength: PropTypes.number,

        /**
         * Whether or not to proxy image URLs
         */
        proxyImages: PropTypes.bool,

        /**
         * Any extra props that should be passed into the image component
         */
        imageProps: PropTypes.object,

        /**
         * prop for passed down to image component for dimensions
         */
        imagesMetadata: PropTypes.object,

        /**
         * Whether or not to place the LinkTooltip component inside links
         */
        hasPluginTooltips: PropTypes.bool,

        /**
         * Post id prop passed down to markdown image
         */
        postId: PropTypes.string,

        /**
         * Post id prop passed down to markdown image
         */
        postType: PropTypes.string,
        emojiMap: PropTypes.object,
    };

    static defaultProps = {
        options: {},
        isRHS: false,
        proxyImages: true,
        imagesMetadata: {},
        postId: '', // Needed to avoid proptypes console errors for cases like channel header, which doesn't have a proper value
    };

    render() {
        if (!this.props.enableFormatting) {
            return <span>{this.props.message}</span>;
        }

        const options = Object.assign({
            autolinkedUrlSchemes: this.props.autolinkedUrlSchemes,
            siteURL: this.props.siteURL,
            mentionKeys: this.props.mentionKeys,
            atMentions: true,
            channelNamesMap: this.props.channelNamesMap,
            proxyImages: this.props.hasImageProxy && this.props.proxyImages,
            team: this.props.team,
            minimumHashtagLength: this.props.minimumHashtagLength,
        }, this.props.options);

        const htmlFormattedText = TextFormatting.formatText(this.props.message, options, this.props.emojiMap);
        return messageHtmlToComponent(htmlFormattedText, this.props.isRHS, {
            imageProps: this.props.imageProps,
            imagesMetadata: this.props.imagesMetadata,
            hasPluginTooltips: this.props.hasPluginTooltips,
            postId: this.props.postId,
            postType: this.props.postType,
            mentionHighlight: this.props.options.mentionHighlight,
        });
    }
}
