// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Post, PostPreviewMetadata} from '@mattermost/types/posts';
import {UserProfile} from '@mattermost/types/users';

import {PostPluginComponent} from 'types/store/plugins';

import {Posts} from 'mattermost-redux/constants';

import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils';
import DelayedAction from 'utils/delayed_action';
import Constants from 'utils/constants';

import CommentedOn from 'components/post_view/commented_on';
import FileAttachmentListContainer from 'components/file_attachment_list';
import FailedPostOptions from 'components/post_view/failed_post_options';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageView from 'components/post_view/post_message_view';
import PostMessagePreview from 'components/post_view/post_message_preview';
import ReactionList from 'components/post_view/reaction_list';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import RepliedTo from 'components/post_view/replied_to';
import {Channel} from '@mattermost/types/channels';
import {Team} from '@mattermost/types/teams';

const SENDING_ANIMATION_DELAY = 3000;

export interface Props {

    /**
     * The post to render the body of
     */
    post: Post;

    /**
     * The parent post of the thread this post is in
     */
    parentPost?: Post;

    /**
     * The poster of the parent post, if exists
     */
    parentPostUser?: UserProfile | null;

    /**
     * Callback func for file menu open
     */
    handleFileDropdownOpened: (opened: boolean) => void;

    /**
     * The function called when the comment icon is clicked
     */
    handleCommentClick?: React.EventHandler<React.MouseEvent>;

    /**
     * Set to render post body compactly
     */
    compactDisplay: boolean;

    /**
     * Set to highlight comment as a mention
     */
    isCommentMention: boolean;

    /**
     * Set to render a preview of the parent post above this reply
     */
    isFirstReply: boolean;

    /*
     * Post type components from plugins
     */
    pluginPostTypes: Record<string, PostPluginComponent>;

    /*
     * Set to display broadcasted thread replies
     */
    isCRTEnabled: boolean;

    /*
     * Current team
     */
    currentTeam: Team;

    /*
     * Channel
     */
    channel: Channel;
}

interface State {
    sending: boolean;
}

export default class PostBody extends React.PureComponent<Props, State> {
    private sendingAction: DelayedAction;

    constructor(props: Props) {
        super(props);

        this.sendingAction = new DelayedAction(() => {
            const post = this.props.post;
            if (post && post.id === post.pending_post_id) {
                this.setState({sending: true});
            }
        });

        this.state = {sending: false};
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (state.sending && props.post && props.post.id !== props.post.pending_post_id) {
            return {
                sending: false,
            };
        }

        return null;
    }

    componentDidUpdate() {
        if (this.state.sending === false) {
            this.sendingAction.cancel();
        }
    }

    componentDidMount() {
        const post = this.props.post;
        if (post && post.id === post.pending_post_id) {
            this.sendingAction.fireAfter(SENDING_ANIMATION_DELAY);
        }
    }

    componentWillUnmount() {
        this.sendingAction.cancel();
    }

    render() {
        const {post, parentPost, parentPostUser} = this.props;

        let comment;
        let postClass = '';
        const isEphemeral = Utils.isPostEphemeral(post);

        let repliedTo;

        if (this.props.isCRTEnabled && post.props?.broadcasted_thread_reply && parentPost && parentPostUser && post.type !== Constants.PostTypes.EPHEMERAL) {
            repliedTo = (
                <RepliedTo
                    post={parentPost}
                    parentPostUser={parentPostUser}
                    onCommentClick={this.props.handleCommentClick}
                />
            );
        } else if (!this.props.isCRTEnabled && this.props.isFirstReply && parentPost && parentPostUser && post.type !== Constants.PostTypes.EPHEMERAL) {
            comment = (
                <CommentedOn
                    post={parentPost}
                    parentPostUser={parentPostUser}
                    onCommentClick={this.props.handleCommentClick}
                />
            );
        }

        let failedOptions;
        if (this.props.post.failed) {
            postClass += ' post--fail';
            failedOptions = <FailedPostOptions post={this.props.post}/>;
        }

        if (PostUtils.isEdited(this.props.post)) {
            postClass += ' post--edited';
        }

        let fileAttachmentHolder = null;
        if (
            ((post.file_ids && post.file_ids.length > 0) ||
                (post.filenames && post.filenames.length > 0)) &&
            this.props.post.state !== Posts.POST_DELETED
        ) {
            fileAttachmentHolder = (
                <FileAttachmentListContainer
                    post={post}
                    compactDisplay={this.props.compactDisplay}
                    handleFileDropdownOpened={this.props.handleFileDropdownOpened}
                />
            );
        }

        if (this.state.sending) {
            postClass += ' post-waiting';
        }

        let messageWrapper;

        if (this.props.isCRTEnabled && post.props?.broadcasted_thread_reply) {
            const previewMetaData: PostPreviewMetadata = {
                post,
                post_id: post.id,
                team_name: this.props.currentTeam.name,
                channel_display_name: this.props.channel.display_name,
                channel_id: this.props.channel.id,
                channel_type: this.props.channel.type,
            };

            messageWrapper = (
                <>
                    {failedOptions}
                    {this.state.sending && <LoadingSpinner/>}
                    <PostMessagePreview
                        metadata={previewMetaData}
                        previewPost={post}
                        handleFileDropdownOpened={this.props.handleFileDropdownOpened}
                        previewFooterMessage={' '}
                        preventClickAction={true}
                    />
                </>
            );
        } else {
            messageWrapper = (
                <>
                    {failedOptions}
                    {this.state.sending && <LoadingSpinner/>}
                    <PostMessageView
                        post={this.props.post}
                        compactDisplay={this.props.compactDisplay}
                    />
                </>
            );
        }

        const hasPlugin =
            (post.type && this.props.pluginPostTypes.hasOwnProperty(post.type)) ||
            (post.props &&
                post.props.type &&
                this.props.pluginPostTypes.hasOwnProperty(post.props.type));

        let messageWithAdditionalContent;
        if (this.props.post.state === Posts.POST_DELETED || hasPlugin || post.props?.broadcasted_thread_reply) {
            messageWithAdditionalContent = messageWrapper;
        } else {
            messageWithAdditionalContent = (
                <PostBodyAdditionalContent
                    post={this.props.post}
                    handleFileDropdownOpened={this.props.handleFileDropdownOpened}
                >
                    {messageWrapper}
                </PostBodyAdditionalContent>
            );
        }

        let mentionHighlightClass = '';
        if (this.props.isCommentMention) {
            mentionHighlightClass = 'mention-comment';
        }

        let ephemeralPostClass = '';
        if (isEphemeral) {
            ephemeralPostClass = 'post--ephemeral';
        }

        return (
            <>
                {comment || repliedTo}
                <div
                    id={`${post.id}_message`}
                    className={`post__body ${mentionHighlightClass} ${ephemeralPostClass} ${postClass}`}
                >
                    {messageWithAdditionalContent}
                    {!post.props?.broadcasted_thread_reply && fileAttachmentHolder}
                    {!post.props?.broadcasted_thread_reply && <ReactionList post={post}/>}
                </div>
            </>
        );
    }
}
