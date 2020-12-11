// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Posts} from 'mattermost-redux/constants';

import {Post} from 'mattermost-redux/src/types/posts';

import {UserProfile} from 'mattermost-redux/types/users';

import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import DelayedAction from 'utils/delayed_action';
import Constants from 'utils/constants.jsx';

import CommentedOn from 'components/post_view/commented_on';
import FileAttachmentListContainer from 'components/file_attachment_list';
import FailedPostOptions from 'components/post_view/failed_post_options';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageView from 'components/post_view/post_message_view';
import ReactionList from 'components/post_view/reaction_list';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import {PluginsState} from 'types/store/plugins';

const SENDING_ANIMATION_DELAY = 3000;

type Props = {

    /**
   * The post to render the body of
   */
    post: Post;

    parentPost?: Post;

    /**
   * The parent post of the thread this post is in
   */
    parentPostUser?: UserProfile | null;

    /**
   * Set to render a preview of the parent post above this reply
   */
    isFirstReply?: boolean;

    /**
   * The function called when the comment icon is clicked
   */
    handleCommentClick: () => void;

    /**
   * Set to render post body compactly
   */
    compactDisplay?: boolean;

    /**
   * Set to highlight comment as a mention
   */
    isCommentMention?: boolean;

    /**
   * Post type components from plugins
   */
    pluginPostTypes?: PluginsState['postTypes'];

    /**
   * Flag passed down to PostBodyAdditionalContent for determining if post embed is visible
   */
    isEmbedVisible?: boolean;

    /**
   * Whether or not the post username can be overridden.
   */
    enablePostUsernameOverride: boolean;

    /**
   * Set not to allow edits on post
   */
    isReadOnly?: boolean;
};

type State = {
    sending: boolean;
};
export default class PostBody extends React.PureComponent<Props, State> {
    static defaultProps = {
        isReadOnly: false,
    };
    sendingAction: DelayedAction;

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
        if (
            state.sending &&
      props.post &&
      props.post.id !== props.post.pending_post_id
        ) {
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
        const post = this.props.post;
        const parentPost = this.props.parentPost;
        const parentPostUser = this.props.parentPostUser;

        let comment;
        let postClass = '';
        const isEphemeral = Utils.isPostEphemeral(post);

        //We want to show the commented on component even if the post was deleted
        if (
            this.props.isFirstReply &&
      parentPost &&
      post &&
      post.type !== Constants.PostTypes.EPHEMERAL
        ) {
            comment = (
                <CommentedOn
                    post={parentPost}
                    parentPostUser={parentPostUser}
                    onCommentClick={this.props.handleCommentClick}
                />
            );
        }

        let failedOptions;
        if (this.props.post?.failed) {
            postClass += ' post--fail';
            failedOptions = <FailedPostOptions post={this.props.post}/>;
        }

        if (PostUtils.isEdited(this.props.post)) {
            postClass += ' post--edited';
        }

        let fileAttachmentHolder = null;
        if (
            ((post?.file_ids?.length > 0) ||
        (post?.filenames?.length > 0)) &&
      this.props.post?.state !== Posts.POST_DELETED
        ) {
            fileAttachmentHolder = (
                <FileAttachmentListContainer
                    post={post}
                    compactDisplay={this.props.compactDisplay}
                />
            );
        }

        if (this.state.sending) {
            postClass += ' post-waiting';
        }

        const messageWrapper = (
            <React.Fragment>
                {failedOptions}
                {this.state.sending && <LoadingSpinner/>}
                <PostMessageView
                    post={this.props.post}
                    compactDisplay={this.props.compactDisplay}
                />
            </React.Fragment>
        );

        const hasPlugin =
      (
        post?.type &&
        this.props.pluginPostTypes?.hasOwnProperty(post.type)) ||
      (
        post?.props?.type &&
        this.props.pluginPostTypes?.hasOwnProperty(post.props.type));

        let messageWithAdditionalContent;
        if (
            (this.props.post && this.props.post.state === Posts.POST_DELETED) ||
      hasPlugin
        ) {
            messageWithAdditionalContent = messageWrapper;
        } else {
            messageWithAdditionalContent = (
                <PostBodyAdditionalContent
                    post={this.props.post}
                    isEmbedVisible={this.props.isEmbedVisible}
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
        const divId = post ? `${post.id}_message` : undefined;
        return (
            <div>
                {comment}
                <div
                    id={divId}
                    className={`post__body ${mentionHighlightClass} ${ephemeralPostClass} ${postClass}`}
                >
                    {messageWithAdditionalContent}
                    {fileAttachmentHolder}
                    <ReactionList post={post}/>
                </div>
            </div>
        );
    }
}
