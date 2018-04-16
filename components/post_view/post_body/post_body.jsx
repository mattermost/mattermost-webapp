// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Posts} from 'mattermost-redux/constants';

import * as PostActions from 'actions/post_actions.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import FileAttachmentListContainer from 'components/file_attachment_list';
import CommentedOnFilesMessage from 'components/post_view/commented_on_files_message';
import FailedPostOptions from 'components/post_view/failed_post_options';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageView from 'components/post_view/post_message_view';
import ReactionListContainer from 'components/post_view/reaction_list';
import loadingGif from 'images/load.gif';

const SENDING_ANIMATION_DELAY = 3000;

export default class PostBody extends React.PureComponent {
    static propTypes = {

        /**
         * The post to render the body of
         */
        post: PropTypes.object.isRequired,

        /**
         * The parent post of the thread this post is in
         */
        parentPost: PropTypes.object,

        /**
         * The poster of the parent post, if exists
         */
        parentPostUser: PropTypes.object,

        /**
         * The function called when the comment icon is clicked
         */
        handleCommentClick: PropTypes.func.isRequired,

        /**
         * Set to render post body compactly
         */
        compactDisplay: PropTypes.bool,

        /**
         * Set to highlight comment as a mention
         */
        isCommentMention: PropTypes.bool,

        /**
         * Set to render a preview of the parent post above this reply
         */
        isFirstReply: PropTypes.bool,

        /**
         * Set to collapse image and video previews
         */
        previewCollapsed: PropTypes.string,

        /**
         * User's preference to link previews
         */
        previewEnabled: PropTypes.bool,

        /**
         * Post identifiers for selenium tests
         */
        lastPostCount: PropTypes.number,

        /*
         * Post type components from plugins
         */
        pluginPostTypes: PropTypes.object,

        /**
         * Flag passed down to PostBodyAdditionalContent for determining if post embed is visible
         */
        isEmbedVisible: PropTypes.bool,

        /**
         * Whether or not the post username can be overridden.
         */
        enablePostUsernameOverride: PropTypes.bool.isRequired,

        /**
         * Set not to allow edits on post
         */
        isReadOnly: PropTypes.bool,
    }

    static defaultProps = {
        isReadOnly: false,
    }

    constructor(props) {
        super(props);

        this.sendingAction = new DelayedAction(
            () => {
                const post = this.props.post;
                if (post && post.id === post.pending_post_id) {
                    this.setState({sending: true});
                }
            }
        );

        this.state = {sending: false};
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

    componentWillReceiveProps(nextProps) {
        const post = nextProps.post;
        if (post && post.id !== post.pending_post_id) {
            this.sendingAction.cancel();
            this.setState({sending: false});
        }
    }

    render() {
        const post = this.props.post;
        const parentPost = this.props.parentPost;

        let comment = '';
        let postClass = '';
        const isEphemeral = Utils.isPostEphemeral(post);
        if (this.props.isFirstReply && parentPost && !isEphemeral) {
            const profile = this.props.parentPostUser;

            let apostrophe = '';
            let name = '...';
            if (profile != null) {
                let username = Utils.getDisplayNameByUser(profile);
                if (parentPost.props &&
                        parentPost.props.from_webhook &&
                        parentPost.props.override_username &&
                        this.props.enablePostUsernameOverride) {
                    username = parentPost.props.override_username;
                }

                if (username.slice(-1) === 's') {
                    apostrophe = '\'';
                } else {
                    apostrophe = '\'s';
                }
                name = (
                    <a
                        className='theme'
                        onClick={PostActions.searchForTerm.bind(null, username)}
                    >
                        {username}
                    </a>
                );
            }

            let message = '';
            if (parentPost.message) {
                message = Utils.replaceHtmlEntities(parentPost.message);
            } else if (parentPost.file_ids && parentPost.file_ids.length > 0) {
                message = (
                    <CommentedOnFilesMessage
                        parentPostId={parentPost.id}
                    />
                );
            }

            comment = (
                <div className='post__link'>
                    <span>
                        <FormattedMessage
                            id='post_body.commentedOn'
                            defaultMessage='Commented on {name}{apostrophe} message: '
                            values={{
                                name,
                                apostrophe,
                            }}
                        />
                        <a
                            className='theme'
                            onClick={this.props.handleCommentClick}
                        >
                            {message}
                        </a>
                    </span>
                </div>
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
        if (((post.file_ids && post.file_ids.length > 0) || (post.filenames && post.filenames.length > 0)) && this.props.post.state !== Posts.POST_DELETED) {
            fileAttachmentHolder = (
                <FileAttachmentListContainer
                    post={post}
                    compactDisplay={this.props.compactDisplay}
                />
            );
        }

        let sending;
        if (this.state.sending) {
            sending = (
                <img
                    className='post-loading-gif pull-right'
                    src={loadingGif}
                />
            );

            postClass += ' post-waiting';
        }

        const messageWrapper = (
            <div
                key={`${post.id}_message`}
                id={`${post.id}_message`}
                className={postClass}
            >
                {failedOptions}
                {sending}
                <PostMessageView
                    lastPostCount={this.props.lastPostCount}
                    post={this.props.post}
                    compactDisplay={this.props.compactDisplay}
                    hasMention={true}
                />
            </div>
        );

        const hasPlugin = post.type && this.props.pluginPostTypes.hasOwnProperty(post.type);

        let messageWithAdditionalContent;
        if (this.props.post.state === Posts.POST_DELETED || hasPlugin) {
            messageWithAdditionalContent = messageWrapper;
        } else {
            messageWithAdditionalContent = (
                <PostBodyAdditionalContent
                    post={this.props.post}
                    previewCollapsed={this.props.previewCollapsed}
                    previewEnabled={this.props.previewEnabled}
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

        return (
            <div>
                {comment}
                <div className={`post__body ${mentionHighlightClass} ${ephemeralPostClass}`}>
                    {messageWithAdditionalContent}
                    {fileAttachmentHolder}
                    <ReactionListContainer
                        post={post}
                        isReadOnly={this.props.isReadOnly}
                    />
                </div>
            </div>
        );
    }
}
