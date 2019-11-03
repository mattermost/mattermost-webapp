// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Posts} from 'mattermost-redux/constants';
import {intlShape} from 'react-intl';
import {isMeMessage as checkIsMeMessage} from 'mattermost-redux/utils/post_utils';

import * as PostUtils from 'utils/post_utils.jsx';
import {A11yCustomEventTypes} from 'utils/constants';
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
         * The function to create an aria-label
         */
        createAriaLabel: PropTypes.func.isRequired,

        /**
         * The logged in user ID
         */
        currentUserId: PropTypes.string.isRequired,

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
        shouldHighlight: PropTypes.bool,

        /**
         * Set to render this post as if it was attached to the previous post
         */
        consecutivePostByUser: PropTypes.bool,

        /**
         * Set if the previous post is a comment
         */
        previousPostIsComment: PropTypes.bool,

        /*
         * Function called when the post options dropdown is opened
         */
        togglePostMenu: PropTypes.func,

        /**
         * Set to render this comment as a mention
         */
        isCommentMention: PropTypes.bool,

        /**
         * The number of replies in the same thread as this post
         */
        replyCount: PropTypes.number,

        actions: PropTypes.shape({
            selectPost: PropTypes.func.isRequired,
            selectPostCard: PropTypes.func.isRequired,
        }).isRequired,
    }

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    static defaultProps = {
        post: {},
    };

    constructor(props) {
        super(props);

        this.postRef = React.createRef();

        this.state = {
            dropdownOpened: false,
            hover: false,
            a11yActive: false,
            currentAriaLabel: '',
            ariaHidden: true,
        };
    }

    componentDidMount() {
        this.postRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
        this.postRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
    }
    componentWillUnmount() {
        this.postRef.current.removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
        this.postRef.current.removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
    }

    componentDidUpdate() {
        if (this.state.a11yActive) {
            this.postRef.current.dispatchEvent(new Event(A11yCustomEventTypes.UPDATE));
        }
    }

    handleCommentClick = (e) => {
        e.preventDefault();

        const post = this.props.post;
        if (!post) {
            return;
        }

        this.props.actions.selectPost(post);
    }

    handleCardClick = (post) => {
        if (!post) {
            return;
        }

        this.props.actions.selectPostCard(post);
    }

    handleDropdownOpened = (opened) => {
        if (this.props.togglePostMenu) {
            this.props.togglePostMenu(opened);
        }

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

    getClassName = (post, isSystemMessage, isMeMessage, fromWebhook, fromAutoResponder, fromBot) => {
        let className = 'post';

        if (post.failed || post.state === Posts.POST_DELETED) {
            className += ' post--hide-controls';
        }

        if (this.props.shouldHighlight) {
            className += ' post--highlight';
        }

        let rootUser = '';
        if (this.hasSameRoot(this.props) && !fromBot) {
            rootUser = 'same--root';
        } else {
            rootUser = 'other--root';
        }

        let currentUserCss = '';
        if (this.props.currentUserId === post.user_id && !fromWebhook && !isSystemMessage) {
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

        if (isSystemMessage || isMeMessage) {
            className += ' post--system';
            if (isSystemMessage) {
                currentUserCss = '';
                postType = '';
                rootUser = '';
            }
        }

        if (fromAutoResponder) {
            postType = 'post--comment same--root';
        }

        if (this.props.compactDisplay) {
            className += ' post--compact';
        }

        if (this.state.dropdownOpened || this.state.a11yActive) {
            className += ' post--hovered';
        }

        if (post.is_pinned) {
            className += ' post--pinned';
        }

        return className + ' ' + sameUserClass + ' ' + rootUser + ' ' + postType + ' ' + currentUserCss;
    }

    setHover = () => {
        this.setState({hover: true});
    }

    unsetHover = () => {
        this.setState({hover: false});
    }

    handleA11yActivateEvent = () => {
        this.setState({
            a11yActive: true,
            ariaHidden: false,
        });
    }

    handleA11yDeactivateEvent = () => {
        this.setState({
            a11yActive: false,
            ariaHidden: true,
        });
    }

    handlePostFocus = () => {
        this.setState({currentAriaLabel: this.props.createAriaLabel(this.context.intl)});
    }

    render() {
        const {post} = this.props;
        if (!post.id) {
            return null;
        }

        const isSystemMessage = PostUtils.isSystemMessage(post);
        const isMeMessage = checkIsMeMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);
        const fromWebhook = post && post.props && post.props.from_webhook === 'true';
        const fromBot = post && post.props && post.props.from_bot === 'true';

        let profilePic;
        const hideProfilePicture = this.hasSameRoot(this.props) && this.props.consecutivePostByUser && (!post.root_id && this.props.replyCount === 0) && !fromBot;
        if (!hideProfilePicture) {
            profilePic = (
                <PostProfilePicture
                    compactDisplay={this.props.compactDisplay}
                    post={post}
                    userId={post.user_id}
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
                ref={this.postRef}
                id={'post_' + post.id}
                data-testid='postView'
                role='listitem'
                className={`a11y__section ${this.getClassName(post, isSystemMessage, isMeMessage, fromWebhook, fromAutoResponder, fromBot)}`}
                tabIndex='0'
                onFocus={this.handlePostFocus}
                onBlur={this.removeFocus}
                onMouseOver={this.setHover}
                onMouseLeave={this.unsetHover}
                onTouchStart={this.setHover}
                aria-label={this.state.currentAriaLabel}
                aria-atomic={true}
            >
                <div
                    role='application'
                    id='postContent'
                    data-testid='postContent'
                    className={'post__content ' + centerClass}
                    aria-hidden={this.state.ariaHidden}
                >
                    <div className='post__img'>
                        {profilePic}
                    </div>
                    <div>
                        <PostHeader
                            post={post}
                            handleCommentClick={this.handleCommentClick}
                            handleCardClick={this.handleCardClick}
                            handleDropdownOpened={this.handleDropdownOpened}
                            compactDisplay={this.props.compactDisplay}
                            isFirstReply={this.props.isFirstReply}
                            replyCount={this.props.replyCount}
                            showTimeWithoutHover={!hideProfilePicture}
                            hover={this.state.hover || this.state.a11yActive}
                        />
                        <PostBody
                            post={post}
                            handleCommentClick={this.handleCommentClick}
                            compactDisplay={this.props.compactDisplay}
                            isCommentMention={this.props.isCommentMention}
                            isFirstReply={this.props.isFirstReply}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
