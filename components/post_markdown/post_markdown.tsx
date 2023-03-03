// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import memoize from 'memoize-one';

import Markdown from 'components/markdown';

import {MentionKey, TextFormattingOptions} from 'utils/text_formatting';

import {Posts} from 'mattermost-redux/constants';

import {Post} from '@mattermost/types/posts';
import {Channel} from '@mattermost/types/channels';

import {Team} from '@mattermost/types/teams';

import {renderReminderSystemBotMessage, renderSystemMessage} from './system_message_helpers';

type Props = {

    /*
     * Any extra props that should be passed into the image component
     */
    imageProps?: Record<string, any>;

    /*
     * Whether or not this text is part of the RHS
     */
    isRHS?: boolean;

    /*
     * The post text to be rendered
     */
    message: string;

    /*
     * The optional post for which this message is being rendered
     */
    post?: Post;

    /*
     * The id of the channel that this post is being rendered in
     */
    channelId?: string;
    channel: Channel;
    currentTeam: Team;
    options?: TextFormattingOptions;
    pluginHooks?: Array<Record<string, any>>;

    /**
     * Whether or not to place the LinkTooltip component inside links
     */
    hasPluginTooltips?: boolean;
    isUserCanManageMembers?: boolean;
    mentionKeys: MentionKey[];

    /**
     * Whether or not to render the post edited indicator
     * @default true
     */
    showPostEditedIndicator?: boolean;

    /**
     * Whether the user prefers Military time
     */
    isMilitaryTime?: boolean;
    timezone?: string;
}

export default class PostMarkdown extends React.PureComponent<Props> {
    static defaultProps = {
        isRHS: false,
        pluginHooks: [],
        options: {},
        showPostEditedIndicator: true,
    };

    getOptions = memoize(
        (options?: TextFormattingOptions, disableGroupHighlight?: boolean, mentionHighlight?: boolean, editedAt?: number) => {
            return {
                ...options,
                disableGroupHighlight,
                mentionHighlight,
                editedAt,
            };
        })

    render() {
        let {message} = this.props;
        const {post, mentionKeys} = this.props;

        if (post) {
            const renderedSystemMessage = renderSystemMessage(post,
                this.props.currentTeam,
                this.props.channel,
                this.props.isUserCanManageMembers,
                this.props.isMilitaryTime,
                this.props.timezone);
            if (renderedSystemMessage) {
                return <div>{renderedSystemMessage}</div>;
            }
        }

        if (post && post.type === Posts.POST_TYPES.REMINDER) {
            const renderedSystemBotMessage = renderReminderSystemBotMessage(post, this.props.currentTeam);
            return <div>{renderedSystemBotMessage}</div>;
        }

        // Proxy images if we have an image proxy and the server hasn't already rewritten the post's image URLs.
        const proxyImages = !post || !post.message_source || post.message === post.message_source;
        const channelNamesMap = post && post.props && post.props.channel_mentions;

        this.props.pluginHooks?.forEach((o) => {
            if (o && o.hook && post) {
                message = o.hook(post, message);
            }
        });

        let mentionHighlight = this.props.options?.mentionHighlight;
        if (post && post.props) {
            mentionHighlight = !post.props.mentionHighlightDisabled;
        }

        const options = this.getOptions(
            this.props.options,
            post?.props?.disable_group_highlight === true,
            mentionHighlight,
            post?.edit_at,
        );

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
                imagesMetadata={this.props.post?.metadata?.images}
                postId={this.props.post?.id}
                editedAt={this.props.showPostEditedIndicator ? this.props.post?.edit_at : undefined}
            />
        );
    }
}
