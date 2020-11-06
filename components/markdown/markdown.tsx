// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Team} from 'mattermost-redux/types/teams';
import {PostImage, PostType} from 'mattermost-redux/types/posts';
import {Dictionary} from 'mattermost-redux/types/utilities';

import messageHtmlToComponent from 'utils/message_html_to_component';
import EmojiMap from 'utils/emoji_map';
import {ChannelNamesMap, TextFormattingOptions, formatText, MentionKey} from 'utils/text_formatting';

type Props = {

    /*
     * An object mapping channel names to channels for the current team
     */
    channelNamesMap?: ChannelNamesMap;

    /*
     * An array of URL schemes that should be turned into links. Anything that looks
     * like a link will be turned into a link if this is not provided.
     */
    autolinkedUrlSchemes?: Array<string>;

    /*
     * Whether or not to do Markdown rendering
     */
    enableFormatting?: boolean;

    /*
     * Whether or not this text is part of the RHS
     */
    isRHS?: boolean;

    /*
     * An array of paths on the server that are managed by another server
     */
    managedResourcePaths?: string[];

    /*
     * An array of words that can be used to mention a user
     */
    mentionKeys?: Array<MentionKey>;

    /*
     * The text to be rendered
     */
    message: string;

    /*
     * Any additional text formatting options to be used
     */
    options: Partial<TextFormattingOptions>;

    /*
     * The root Site URL for the page
     */
    siteURL?: string;

    /*
     * The current team
     */
    team?: Team;

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
    // eslint-disable-next-line @typescript-eslint/ban-types
    imageProps?: object;

    /**
     * prop for passed down to image component for dimensions
     */
    imagesMetadata?: Dictionary<PostImage>;

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
    postType?: PostType;
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
            managedResourcePaths: this.props.managedResourcePaths,
        }, this.props.options);

        const htmlFormattedText = formatText(this.props.message, options, this.props.emojiMap);
        return messageHtmlToComponent(htmlFormattedText, this.props.isRHS, {
            imageProps: this.props.imageProps,
            imagesMetadata: this.props.imagesMetadata,
            hasPluginTooltips: this.props.hasPluginTooltips,
            postId: this.props.postId,
            postType: this.props.postType,
            mentionHighlight: this.props.options.mentionHighlight,
            disableGroupHighlight: this.props.options.disableGroupHighlight,
        });
    }
}
