// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Parser, ProcessNodeDefinitions} from 'html-to-react';

import {Posts} from 'mattermost-redux/constants';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';

import store from 'stores/redux_store.jsx';

import * as PostUtils from 'utils/post_utils.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';

import AtMention from 'components/at_mention';
import MarkdownImage from 'components/markdown_image';

import {renderSystemMessage} from './system_message_helpers.jsx';

export default class PostMessageView extends React.PureComponent {
    static propTypes = {

        /*
         * The post to render the message for
         */
        post: PropTypes.object.isRequired,

        /*
         * Object using emoji names as keys with custom emojis as the values
         */
        emojis: PropTypes.object.isRequired,

        /*
         * The team the post was made in
         */
        team: PropTypes.object.isRequired,

        /*
         * Set to enable Markdown formatting
         */
        enableFormatting: PropTypes.bool,

        /*
         * An array of words that can be used to mention a user
         */
        mentionKeys: PropTypes.arrayOf(PropTypes.string),

        /*
         * The URL that the app is hosted on
         */
        siteUrl: PropTypes.string,

        /*
         * Options specific to text formatting
         */
        options: PropTypes.object,

        /*
         * Post identifiers for selenium tests
         */
        lastPostCount: PropTypes.number,

        /**
         * Set to render post body compactly
         */
        compactDisplay: PropTypes.bool,

        /**
         * Flags if the post_message_view is for the RHS (Reply).
         */
        isRHS: PropTypes.bool,

        /**
         * Flags if the post_message_view is for the RHS (Reply).
         */
        hasMention: PropTypes.bool,

        /*
         * Logged in user's theme
         */
        theme: PropTypes.object.isRequired,

        /*
         * Post type components from plugins
         */
        pluginPostTypes: PropTypes.object,

        /**
         * The logged in user
         */
        currentUser: PropTypes.object.isRequired
    };

    static defaultProps = {
        options: {},
        mentionKeys: [],
        isRHS: false,
        hasMention: false,
        pluginPostTypes: {}
    };

    renderDeletedPost() {
        return (
            <p>
                <FormattedMessage
                    id='post_body.deleted'
                    defaultMessage='(message deleted)'
                />
            </p>
        );
    }

    renderEditedIndicator() {
        if (!PostUtils.isEdited(this.props.post)) {
            return null;
        }

        return (
            <span className='post-edited-indicator'>
                <FormattedMessage
                    id='post_message_view.edited'
                    defaultMessage='(edited)'
                />
            </span>
        );
    }

    postMessageHtmlToComponent(html) {
        const parser = new Parser();
        const attrib = 'data-mention';
        const processNodeDefinitions = new ProcessNodeDefinitions(React);

        function isValidNode() {
            return true;
        }

        const processingInstructions = [
            {
                replaceChildren: true,
                shouldProcessNode: (node) => node.attribs && node.attribs[attrib],
                processNode: (node) => {
                    const mentionName = node.attribs[attrib];

                    return (
                        <AtMention
                            mentionName={mentionName}
                            isRHS={this.props.isRHS}
                            hasMention={this.props.hasMention}
                        />
                    );
                }
            },
            {
                shouldProcessNode: (node) => node.type === 'tag' && node.name === 'img',
                processNode: (node) => {
                    const {
                        class: className,
                        ...attribs
                    } = node.attribs;

                    return (
                        <MarkdownImage
                            className={className}
                            {...attribs}
                        />
                    );
                }
            },
            {
                shouldProcessNode: () => true,
                processNode: processNodeDefinitions.processDefaultNode
            }
        ];

        return parser.parseWithInstructions(html, isValidNode, processingInstructions);
    }

    render() {
        if (this.props.post.state === Posts.POST_DELETED) {
            return this.renderDeletedPost();
        }

        if (!this.props.enableFormatting) {
            return <span>{this.props.post.message}</span>;
        }

        const postType = this.props.post.type;
        const pluginPostTypes = this.props.pluginPostTypes;
        if (postType) {
            if (pluginPostTypes.hasOwnProperty(postType)) {
                const PluginComponent = pluginPostTypes[postType].component;
                return (
                    <PluginComponent
                        post={this.props.post}
                        mentionKeys={this.props.mentionKeys}
                        compactDisplay={this.props.compactDisplay}
                        isRHS={this.props.isRHS}
                        theme={this.props.theme}
                    />
                );
            }
        }

        const mentionKeys = [...this.props.mentionKeys, this.props.currentUser.username];

        const options = Object.assign({}, this.props.options, {
            emojis: this.props.emojis,
            siteURL: this.props.siteUrl,
            mentionKeys,
            atMentions: true,
            channelNamesMap: getChannelsNameMapInCurrentTeam(store.getState()),
            team: this.props.team
        });

        const renderedSystemMessage = renderSystemMessage(this.props.post, options);
        if (renderedSystemMessage) {
            return <div>{renderedSystemMessage}</div>;
        }

        let postId = null;
        if (this.props.lastPostCount >= 0) {
            postId = Utils.createSafeId('lastPostMessageText' + this.props.lastPostCount);
        }

        let message = this.props.post.message;
        const isEphemeral = Utils.isPostEphemeral(this.props.post);
        if (this.props.compactDisplay && isEphemeral) {
            const visibleMessage = Utils.localizeMessage('post_info.message.visible.compact', ' (Only visible to you)');
            message = message.concat(visibleMessage);
        }
        const htmlFormattedText = TextFormatting.formatText(message, options);
        const postMessageComponent = this.postMessageHtmlToComponent(htmlFormattedText);

        return (
            <div>
                <span
                    id={postId}
                    className='post-message__text'
                    onClick={Utils.handleFormattedTextClick}
                >
                    {postMessageComponent}
                </span>
                {this.renderEditedIndicator()}
            </div>
        );
    }
}
