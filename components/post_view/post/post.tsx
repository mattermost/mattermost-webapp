// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';
import {isMeMessage as checkIsMeMessage} from 'mattermost-redux/utils/post_utils';

import {Post as IPost} from 'mattermost-redux/types/posts';

import * as PostUtils from 'utils/post_utils.jsx';
import Constants, {A11yCustomEventTypes} from 'utils/constants';
import PostProfilePicture from 'components/post_profile_picture';
import PostBody from 'components/post_view/post_body';
import PostHeader from 'components/post_view/post_header';
import PostContext from 'components/post_view/post_context';
import PostPreHeader from 'components/post_view/post_pre_header';

type Props = {

    /**
         * The post to render
         */
    post: IPost,

    /**
         * The function to create an aria-label
         */
    createAriaLabel: (int: IntlShape) => string,

    /**
         * The logged in user ID
         */
    currentUserId: string,

    /**
         * Set to center the post
         */
    center?: boolean,

    /**
         * Set to render post compactly
         */
    compactDisplay?: boolean,

    /**
         * Set to render a preview of the parent post above this reply
         */
    isFirstReply?: boolean,

    /**
         * Set to highlight the background of the post
         */
    shouldHighlight?: boolean,

    /**
         * Set to render this post as if it was attached to the previous post
         */
    consecutivePostByUser?: boolean,

    /**
         * Set if the previous post is a comment
         */
    previousPostIsComment?: boolean,

    /*
         * Function called when the post options dropdown is opened
         */
    togglePostMenu: (value: boolean) => void,

    /**
         * Set to render this comment as a mention
         */
    isCommentMention?: boolean,

    /**
         * The number of replies in the same thread as this post
         */
    replyCount: number,

    /**
         * To Check if the current post is last in the list
         */
    isLastPost?: boolean,

    /**
         * Whether or not the channel that contains this post is archived
         */
    channelIsArchived?: boolean,

    intl: IntlShape,
    actions: {
        selectPost: (post: IPost) => void,
        selectPostCard: (post: IPost) => void,
        markPostAsUnread: (post: IPost) => void,
    },

    /*
         * Set to mark the post as flagged
         */
    isFlagged: boolean,
}

type State = {
    dropdownOpened: boolean,
    hover: boolean,
    alt: boolean,
    a11yActive: boolean,
    currentAriaLabel: string,
    ariaHidden: boolean,
    fadeOutHighlight: boolean,
}

class Post extends React.PureComponent<Props, State> {
    private postRef: React.RefObject<HTMLDivElement>;
    private highlightTimeout: NodeJS.Timeout | undefined;

    constructor(props: Props) {
        super(props);

        this.postRef = React.createRef();

        this.state = {
            dropdownOpened: false,
            hover: false,
            alt: false,
            a11yActive: false,
            currentAriaLabel: '',
            ariaHidden: true,
            fadeOutHighlight: false,
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleAlt);
        document.addEventListener('keyup', this.handleAlt);

        // Refs can be null when this component is shallowly rendered for testing
        if (this.postRef.current) {
            this.postRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.postRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }

        if (this.props.shouldHighlight) {
            this.highlightTimeout = setTimeout(() => {
                this.setState({fadeOutHighlight: true});
            }, Constants.PERMALINK_FADEOUT);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleAlt);
        document.removeEventListener('keyup', this.handleAlt);

        if (this.postRef.current) {
            this.postRef.current.removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.postRef.current.removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }

        if (this.highlightTimeout) {
            clearTimeout(this.highlightTimeout);
        }
    }

    componentDidUpdate() {
        if (this.state.a11yActive && this.postRef.current) {
            this.postRef.current.dispatchEvent(new Event(A11yCustomEventTypes.UPDATE));
        }
    }

    handleCommentClick = () => {
        // e.preventDefault();

        const post = this.props.post;
        if (!post) {
            return;
        }
        this.props.actions.selectPost(post);
    }

    handleCardClick = (post: IPost) => {
        if (!post) {
            return;
        }
        this.props.actions.selectPostCard(post);
    }

    handlePostClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const post = this.props.post;
        if (!post) {
            return;
        }

        if (this.props.channelIsArchived) {
            return;
        }

        if (e.altKey) {
            this.props.actions.markPostAsUnread(post);
        }
    }

    handleDropdownOpened = (opened: boolean) => {
        if (this.props.togglePostMenu) {
            this.props.togglePostMenu(opened);
        }

        this.setState({
            dropdownOpened: opened,
        });
    }

    hasSameRoot = (props: Props) => {
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

    getClassName = (post: IPost, isSystemMessage: boolean, isMeMessage: boolean, fromWebhook: boolean, fromAutoResponder: boolean, fromBot: boolean) => {
        let className = 'post';

        if (post.failed || post.state === Posts.POST_DELETED) {
            className += ' post--hide-controls';
        }

        if (!this.state.fadeOutHighlight && this.props.shouldHighlight) {
            className += ' post--highlight';
            if (post.is_pinned || this.props.isFlagged) {
                className += ' post--pinned-or-flagged-highlight';
            }
        }

        let rootUser = '';
        if (this.hasSameRoot(this.props)) {
            rootUser = 'same--root';
        } else {
            rootUser = 'other--root';
        }

        if (fromBot) {
            className += ' post--bot';
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

        if (post.is_pinned || this.props.isFlagged) {
            className += ' post--pinned-or-flagged';
        }

        if (this.state.alt && !(this.props.channelIsArchived)) {
            className += ' cursor--pointer';
        }

        return className + ' ' + sameUserClass + ' ' + rootUser + ' ' + postType + ' ' + currentUserCss;
    }

    setHover = () => {
        this.setState({hover: true});
    }

    unsetHover = () => {
        this.setState({hover: false});
    }

    handleAlt = (e: KeyboardEvent) => {
        if (this.state.alt !== e.altKey) {
            this.setState({alt: e.altKey});
        }
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
        this.setState({currentAriaLabel: this.props.createAriaLabel(this.props.intl)});
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
                    compactDisplay={Boolean(this.props.compactDisplay)}
                    userId={post.user_id}
                    post={post}
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
            <PostContext.Provider value={{handlePopupOpened: this.handleDropdownOpened} as any}>
                <div
                    ref={this.postRef}
                    id={'post_' + post.id}
                    data-testid='postView'
                    role='listitem'
                    className={`a11y__section ${this.getClassName(post, isSystemMessage, isMeMessage, fromWebhook, fromAutoResponder, fromBot)}`}
                    tabIndex={0}
                    onFocus={this.handlePostFocus}
                    onMouseOver={this.setHover}
                    onMouseLeave={this.unsetHover}
                    onTouchStart={this.setHover}
                    onClick={this.handlePostClick}
                    aria-label={this.state.currentAriaLabel}
                    aria-atomic={true}
                >
                    <PostPreHeader
                        isFlagged={this.props.isFlagged}
                        isPinned={post.is_pinned}
                        channelId={post.channel_id}
                    />
                    <div
                        role='application'
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
                                isLastPost={this.props.isLastPost}
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
            </PostContext.Provider>
        );
    }
}

export default injectIntl(Post);
