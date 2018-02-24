// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Posts} from 'mattermost-redux/constants';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {ActionTypes} from 'utils/constants.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import PostBody from 'components/post_view/post_body';
import PostHeader from 'components/post_view/post_header';
import ProfilePicture from 'components/profile_picture.jsx';
import MattermostLogo from 'components/svg/mattermost_logo';

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
         * Set to mark the poster as in a webrtc call
         */
        isBusy: PropTypes.bool,

        /**
         * The post count used for selenium tests
         */
        lastPostCount: PropTypes.number,

        /**
         * Function to get the post list HTML element
         */
        getPostList: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            dropdownOpened: false,
            hover: false,
            sameRoot: this.hasSameRoot(props),
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({sameRoot: this.hasSameRoot(nextProps)});
    }

    handleCommentClick = (e) => {
        e.preventDefault();

        const post = this.props.post;
        if (!post) {
            return;
        }

        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVED_POST_SELECTED,
            postId: Utils.getRootId(post),
            channelId: post.channel_id,
        });
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

    getClassName = (post, isSystemMessage, fromWebhook) => {
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
        const post = this.props.post || {};

        const isSystemMessage = PostUtils.isSystemMessage(post);
        const fromWebhook = post && post.props && post.props.from_webhook === 'true';

        let status = this.props.status;
        if (fromWebhook) {
            status = null;
        }

        let profilePic;
        const hideProfilePicture = this.state.sameRoot && this.props.consecutivePostByUser && (!post.root_id && this.props.replyCount === 0);
        if (!hideProfilePicture) {
            profilePic = (
                <ProfilePicture
                    src={PostUtils.getProfilePicSrcForPost(post, this.props.user)}
                    status={status}
                    user={this.props.user}
                    isBusy={this.props.isBusy}
                    hasMention={true}
                />
            );

            if (fromWebhook) {
                profilePic = (
                    <ProfilePicture
                        src={PostUtils.getProfilePicSrcForPost(post, this.props.user)}
                    />
                );
            } else if (PostUtils.isSystemMessage(post)) {
                profilePic = (
                    <MattermostLogo className='icon'/>
                );
            }

            if (this.props.compactDisplay) {
                if (fromWebhook) {
                    profilePic = (
                        <ProfilePicture
                            src=''
                            status={status}
                            isBusy={this.props.isBusy}
                            user={this.props.user}
                        />
                    );
                } else {
                    profilePic = (
                        <ProfilePicture
                            src=''
                            status={status}
                        />
                    );
                }
            }
        }

        const profilePicContainer = <div className='post__img'>{profilePic}</div>;

        let centerClass = '';
        if (this.props.center) {
            centerClass = 'center';
        }

        return (
            <div
                ref={this.getRef}
                onMouseOver={this.setHover}
                onMouseLeave={this.unsetHover}
            >
                <div
                    id={'post_' + post.id}
                    className={this.getClassName(post, isSystemMessage, fromWebhook)}
                >
                    <div className={'post__content ' + centerClass}>
                        {profilePicContainer}
                        <div>
                            <PostHeader
                                post={post}
                                handleCommentClick={this.handleCommentClick}
                                handleDropdownOpened={this.handleDropdownOpened}
                                user={this.props.user}
                                currentUser={this.props.currentUser}
                                compactDisplay={this.props.compactDisplay}
                                status={this.props.status}
                                isBusy={this.props.isBusy}
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
            </div>
        );
    }
}
