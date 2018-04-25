// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as PostUtils from 'utils/post_utils.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';

import {renderSystemMessage} from './system_message_helpers.jsx';

export default class PostMarkdown extends React.PureComponent {
    static propTypes = {

        /*
         * An object mapping channel names to channels for the current team
         */
        channelNamesMap: PropTypes.object.isRequired,

        /*
         * Whether or not this text is part of the RHS
         */
        isRHS: PropTypes.bool,

        /*
         * An array of words that can be used to mention a user
         */
        mentionKeys: PropTypes.arrayOf(PropTypes.object).isRequired,

        /*
         * The post text to be rendered
         */
        message: PropTypes.string.isRequired,

        /*
         * Any additional text formatting options to be used
         */
        options: PropTypes.object,

        /*
         * The optional post for which this message is being rendered
         */
        post: PropTypes.object,

        /*
         * The root Site URL for the page
         */
        siteURL: PropTypes.string.isRequired,

        /*
         * The current team
         */
        team: PropTypes.object.isRequired,

        /**
         * If an image proxy is enabled.
         */
        hasImageProxy: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        options: {},
        isRHS: false,
    };

    render() {
        const options = Object.assign({
            siteURL: this.props.siteURL,
            mentionKeys: this.props.mentionKeys,
            atMentions: true,
            channelNamesMap: this.props.channelNamesMap,
            team: this.props.team,

            // Proxy images if we have an image proxy and the server hasn't already rewritten the post's image URLs.
            proxyImages: this.props.hasImageProxy && (!this.props.post || !this.props.post.message_source || this.props.post.message === this.props.post.message_source),
        }, this.props.options);

        if (this.props.post) {
            const renderedSystemMessage = renderSystemMessage(this.props.post, options);
            if (renderedSystemMessage) {
                return <div>{renderedSystemMessage}</div>;
            }
        }

        const htmlFormattedText = TextFormatting.formatText(this.props.message, options);
        return PostUtils.messageHtmlToComponent(htmlFormattedText, this.props.isRHS);
    }
}
