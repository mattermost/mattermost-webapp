// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Posts} from 'mattermost-redux/constants';

import * as PostUtils from 'utils/post_utils.jsx';
import PostProfilePicture from 'components/post_profile_picture';
import PostBody from 'components/post_view/post_body';
import PostHeader from 'components/post_view/post_header';

export default class Post extends React.PureComponent {
    static propTypes = {

        /**
         * The post to render
         */
        post: PropTypes.object.isRequired,

        /**
         * The user who created the post
         */
        user: PropTypes.object,

        /**
         * The status of the poster
         */
        status: PropTypes.string,

        /**
         * The logged in user
         */
        currentUser: PropTypes.object.isRequired,

        /**
         * Set to center the post
         */
        center: PropTypes.bool,

        /**
         * Set to render post compactly
         */
        compactDisplay: PropTypes.bool,

        /**
         * Set to render a preview of the parent post above this reply
         */
        isFirstReply: PropTypes.bool,

        /**
         * Set to highlight the background of the post
         */
        highlight: PropTypes.bool,

        /**
         * Set to render this post as if it was attached to the previous post
         */
        consecutivePostByUser: PropTypes.bool,

        /**
         * Set if the previous post is a comment
         */
        previousPostIsComment: PropTypes.bool,

        /**
         * Set to render this comment as a mention
         */
        isCommentMention: PropTypes.bool,

        /**
         * The number of replies in the same thread as this post
         */
        replyCount: PropTypes.number,

        /**
         * The post count used for selenium tests
         */
        lastPostCount: PropTypes.number,

        /**
         * Function to get the post list HTML element
         */
        getPostList: PropTypes.func.isRequired,

        actions: PropTypes.shape({
            selectPost: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        post: {},
    };

    constructor(props) {
        super(props);

        this.state = {
            dropdownOpened: false,
            hover: false,
            sameRoot: this.hasSameRoot(props),
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        this.setState({sameRoot: this.hasSameRoot(nextProps)});
    }

    handleCommentClick = (e) => {
        e.preventDefault();

        const post = this.props.post;
        if (!post) {
            return;
        }

        this.props.actions.selectPost(post);
    }

    handleDropdownOpened = (opened) => {
        this.setState({
            dropdownOpened: opened,
        });
    }

    hasSameRoot = (props) => {
        const post = props.post;

        if (props.isFirstReply) {
            return false;
        } else if (!post.root_id && !props.previousPostIsComment && props.consecutivePostByUser) {
            return true;
        } else if (post.root_id) {
            return true;
        }

        return false;
    }

    getClassName = (post, isSystemMessage, fromWebhook, fromAutoResponder) => {
        let className = 'post';

        if (post.failed || post.state === Posts.POST_DELETED) {
            className += ' post--hide-controls';
        }

        if (this.props.highlight) {
            className += ' post--highlight';
        }

        let rootUser = '';
        if (this.state.sameRoot) {
            rootUser = 'same--root';
        } else {
            rootUser = 'other--root';
        }

        let currentUserCss = '';
        if (this.props.currentUser.id === post.user_id && !fromWebhook && !isSystemMessage) {
            currentUserCss = 'current--user';
        }

        let sameUserClass = '';
        if (this.props.consecutivePostByUser) {
            sameUserClass = 'same--user';
        }

        let postType = '';
        if (post.root_id && post.root_id.length > 0) {
            postType = 'post--comment';
        } else if (this.props.replyCount > 0) {
            postType = 'post--root';
            sameUserClass = '';
            rootUser = '';
        }

        if (isSystemMessage) {
            className += ' post--system';
            sameUserClass = '';
            currentUserCss = '';
            postType = '';
            rootUser = '';
        }

        if (fromAutoResponder) {
            postType = 'post--comment same--root';
        }

        if (this.props.compactDisplay) {
            className += ' post--compact';
        }

        if (this.state.dropdownOpened) {
            className += ' post--hovered';
        }

        if (post.is_pinned) {
            className += ' post--pinned';
        }

        return className + ' ' + sameUserClass + ' ' + rootUser + ' ' + postType + ' ' + currentUserCss;
    }

    getRef = (node) => {
        this.domNode = node;
    }

    setHover = () => {
        this.setState({hover: true});
    }

    unsetHover = () => {
        this.setState({hover: false});
    }

    render() {
        const {post} = this.props;
        if (!post.id) {
            return null;
        }

        const isSystemMessage = PostUtils.isSystemMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);
        const fromWebhook = post && post.props && post.props.from_webhook === 'true';

        let profilePic;
        const hideProfilePicture = this.state.sameRoot && this.props.consecutivePostByUser && (!post.root_id && this.props.replyCount === 0);
        if (!hideProfilePicture) {
            profilePic = (
                <PostProfilePicture
                    compactDisplay={this.props.compactDisplay}
                    post={post}
                    status={this.props.status}
                    user={this.props.user}
                />
            );

            if (fromAutoResponder) {
                profilePic = (
                    <span className='auto-responder'>
                        {profilePic}
                    </span>
                );
            }
        }

        let centerClass = '';
        if (this.props.center) {
            centerClass = 'center';
        }

        return (
            <div
                ref={this.getRef}
                id={'post_' + post.id}
                className={this.getClassName(post, isSystemMessage, fromWebhook, fromAutoResponder)}
                onMouseOver={this.setHover}
                onMouseLeave={this.unsetHover}
                onTouchStart={this.setHover}
            >
                <div className={'post__content ' + centerClass}>
                    <div className='post__img'>
                        {profilePic}
                    </div>
                    <div>
                        <PostHeader
                            post={post}
                            handleCommentClick={this.handleCommentClick}
                            handleDropdownOpened={this.handleDropdownOpened}
                            user={this.props.user}
                            currentUser={this.props.currentUser}
                            compactDisplay={this.props.compactDisplay}
                            status={this.props.status}
                            lastPostCount={this.props.lastPostCount}
                            isFirstReply={this.props.isFirstReply}
                            replyCount={this.props.replyCount}
                            showTimeWithoutHover={!hideProfilePicture}
                            getPostList={this.props.getPostList}
                            hover={this.state.hover}
                        />
                        <PostBody
                            post={post}
                            handleCommentClick={this.handleCommentClick}
                            compactDisplay={this.props.compactDisplay}
                            lastPostCount={this.props.lastPostCount}
                            isCommentMention={this.props.isCommentMention}
                            isFirstReply={this.props.isFirstReply}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
