// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import store from 'stores/redux_store.jsx';

import * as PostUtils from 'utils/post_utils.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';

import {Posts} from 'mattermost-redux/constants';   // eslint-disable-line import/order
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';   // eslint-disable-line import/order

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

    render() {
        const {
            post,
            enableFormatting,
            pluginPostTypes,
            compactDisplay,
            isRHS,
            theme,
            emojis,
            siteUrl,
            team,
            lastPostCount
        } = this.props;

        if (post.state === Posts.POST_DELETED) {
            return this.renderDeletedPost();
        }

        if (!enableFormatting) {
            return <span>{post.message}</span>;
        }

        const postType = post.type;
        if (postType) {
            if (pluginPostTypes.hasOwnProperty(postType)) {
                const PluginComponent = pluginPostTypes[postType].component;
                return (
                    <PluginComponent
                        post={post}
                        mentionKeys={this.props.mentionKeys}
                        compactDisplay={compactDisplay}
                        isRHS={isRHS}
                        theme={theme}
                    />
                );
            }
        }

        const mentionKeys = [...this.props.mentionKeys, this.props.currentUser.username];

        const options = Object.assign({}, this.props.options, {
            emojis,
            siteURL: siteUrl,
            mentionKeys,
            atMentions: true,
            channelNamesMap: getChannelsNameMapInCurrentTeam(store.getState()),
            team
        });

        const renderedSystemMessage = renderSystemMessage(post, options);
        if (renderedSystemMessage) {
            return <div>{renderedSystemMessage}</div>;
        }

        let postId = null;
        if (lastPostCount >= 0) {
            postId = Utils.createSafeId('lastPostMessageText' + lastPostCount);
        }

        let message = post.message;
        const isEphemeral = Utils.isPostEphemeral(post);
        if (compactDisplay && isEphemeral) {
            const visibleMessage = Utils.localizeMessage('post_info.message.visible.compact', ' (Only visible to you)');
            message = message.concat(visibleMessage);
        }
        const htmlFormattedText = TextFormatting.formatText(message, options);
        const postMessageComponent = PostUtils.postMessageHtmlToComponent(htmlFormattedText, isRHS);

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
