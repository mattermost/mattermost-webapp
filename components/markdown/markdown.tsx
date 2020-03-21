// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import messageHtmlToComponent from 'utils/message_html_to_component';
import EmojiMap from 'utils/emoji_map';
import * as TextFormatting from 'utils/text_formatting';

type Options = {
    mentionHighlight?: boolean;
}

type Props = {

    /*
     * An object mapping channel names to channels for the current team
     */
    channelNamesMap?: object;

    /*
     * An array of URL schemes that should be turned into links. Anything that looks
     * like a link will be turned into a link if this is not provided.
     */
    autolinkedUrlSchemes?: Array<any>;

    /*
     * Whether or not to do Markdown rendering
     */
    enableFormatting?: boolean;

    /*
     * Whether or not this text is part of the RHS
     */
    isRHS?: boolean;

    /*
     * An array of words that can be used to mention a user
     */
    mentionKeys?: Array<object>;

    /*
     * The text to be rendered
     */
    message: string;

    /*
     * Any additional text formatting options to be used
     */
    options: Options;

    /*
     * The root Site URL for the page
     */
    siteURL?: string;

    /*
     * The current team
     */
    team?: object;

    /**
     * If an image proxy is enabled.
     */
    hasImageProxy?: boolean;

    /**
     * Minimum number of characters in a hashtag.
     */
    minimumHashtagLength?: number;

    /**
     * Whether or not to proxy image URLs
     */
    proxyImages?: boolean;

    /**
     * Any extra props that should be passed into the image component
     */
    imageProps?: object;

    /**
     * prop for passed down to image component for dimensions
     */
    imagesMetadata?: object;

    /**
     * Whether or not to place the LinkTooltip component inside links
     */
    hasPluginTooltips?: boolean;

    /**
     * Post id prop passed down to markdown image
     */
    postId?: string;

    /**
     * Post id prop passed down to markdown image
     */
    postType?: string;
    emojiMap: EmojiMap;
}

export default class Markdown extends React.PureComponent<Props> {
    static defaultProps: Partial<Props> = {
        options: {},
        isRHS: false,
        proxyImages: true,
        imagesMetadata: {},
        postId: '', // Needed to avoid proptypes console errors for cases like channel header, which doesn't have a proper value
    }

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
