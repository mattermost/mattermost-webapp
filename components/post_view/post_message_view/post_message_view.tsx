// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Posts} from 'mattermost-redux/constants';
import {Post} from 'mattermost-redux/types/posts';

import {Theme} from 'mattermost-redux/types/preferences';

import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils';

import PostMarkdown from 'components/post_markdown';
import Pluggable from 'plugins/pluggable';
import ShowMore from 'components/post_view/show_more';
import {TextFormattingOptions} from 'utils/text_formatting';

type Props = {
    post: Post; /* The post to render the message for */
    enableFormatting?: boolean; /* Set to enable Markdown formatting */
    options?: TextFormattingOptions; /* Options specific to text formatting */
    compactDisplay?: boolean; /* Set to render post body compactly */
    isRHS?: boolean; /* Flags if the post_message_view is for the RHS (Reply). */
    isRHSOpen?: boolean; /* Whether or not the RHS is visible */
    isRHSExpanded?: boolean; /* Whether or not the RHS is expanded */
    theme: Theme; /* Logged in user's theme */
    pluginPostTypes?: any; /* Post type components from plugins */
    currentRelativeTeamUrl: string;
}

type State = {
    collapse: boolean;
    hasOverflow: boolean;
    checkOverflow: number;
}

export default class PostMessageView extends React.PureComponent<Props, State> {
    private imageProps: any;

    static defaultProps = {
        options: {},
        isRHS: false,
        pluginPostTypes: {},
    };

    constructor(props : Props) {
        super(props);

        this.state = {
            collapse: true,
            hasOverflow: false,
            checkOverflow: 0,
        };

        this.imageProps = {
            onImageLoaded: this.handleHeightReceived,
        };
    }

    handleHeightReceived = (height: number) => {
        if (height > 0) {
            // Increment checkOverflow to indicate change in height
            // and recompute textContainer height at ShowMore component
            // and see whether overflow text of show more/less is necessary or not.
            this.setState((prevState) => {
                return {checkOverflow: prevState.checkOverflow + 1};
            });
        }
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
            <span
                id={`postEdited_${this.props.post.id}`}
                className='post-edited__indicator'
            >
                <FormattedMessage
                    id='post_message_view.edited'
                    defaultMessage='(edited)'
                />
            </span>
        );
    }

    handleFormattedTextClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        Utils.handleFormattedTextClick(e, this.props.currentRelativeTeamUrl);

    render() {
        const {
            post,
            enableFormatting,
            options,
            pluginPostTypes,
            compactDisplay,
            isRHS,
            theme,
        } = this.props;

        if (post.state === Posts.POST_DELETED) {
            return this.renderDeletedPost();
        }

        if (!enableFormatting) {
            return <span>{post.message}</span>;
        }

        const postType = post.props && post.props.type ? post.props.type : post.type;

        if (pluginPostTypes && pluginPostTypes.hasOwnProperty(postType)) {
            const PluginComponent = pluginPostTypes[postType].component;
            return (
                <PluginComponent
                    post={post}
                    compactDisplay={compactDisplay}
                    isRHS={isRHS}
                    theme={theme}
                />
            );
        }

        let message = post.message;
        const isEphemeral = Utils.isPostEphemeral(post);
        if (compactDisplay && isEphemeral) {
            const visibleMessage = Utils.localizeMessage('post_info.message.visible.compact', ' (Only visible to you)');
            message = message.concat(visibleMessage);
        }

        const id = isRHS ? `rhsPostMessageText_${post.id}` : `postMessageText_${post.id}`;

        return (
            <ShowMore
                checkOverflow={this.state.checkOverflow}
                text={message}
            >
                <div
                    aria-readonly='true'
                    tabIndex={0}
                    id={id}
                    className='post-message__text'
                    onClick={this.handleFormattedTextClick}
                >
                    <PostMarkdown
                        message={message}
                        imageProps={this.imageProps}
                        isRHS={isRHS}
                        options={options}
                        post={post}
                        channelId={post.channel_id}
                        mentionKeys={[]}
                    />
                </div>
                {this.renderEditedIndicator()}
                <Pluggable
                    pluggableName='PostMessageAttachment'
                    postId={post.id}
                    onHeightChange={this.handleHeightReceived}
                />
            </ShowMore>
        );
    }
}
