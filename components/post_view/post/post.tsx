// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Posts} from 'mattermost-redux/constants';
import {isMeMessage as checkIsMeMessage} from 'mattermost-redux/utils/post_utils';
import {UserActivityPost} from 'mattermost-redux/selectors/entities/posts';

import {makeIsEligibleForClick} from 'utils/utils';
import * as PostUtils from 'utils/post_utils';
import Constants, {A11yCustomEventTypes, AppEvents} from 'utils/constants';

import PostProfilePicture from 'components/post_profile_picture';
import PostAriaLabelDiv from 'components/post_view/post_aria_label_div';
import PostBody from 'components/post_view/post_body';
import PostHeader from 'components/post_view/post_header';
import PostContext from 'components/post_view/post_context';
import PostPreHeader from 'components/post_view/post_pre_header';
import ThreadFooter from 'components/threading/channel_threads/thread_footer';
import {trackEvent} from 'actions/telemetry_actions';
import EditPost from 'components/edit_post';
import AutoHeightSwitcher, {AutoHeightSlots} from 'components/common/auto_height_switcher';

// When adding clickable targets within a root post to exclude from post's on click to open thread,
// please add to/maintain the selector below
const isEligibleForClick = makeIsEligibleForClick('.post-image__column, .embed-responsive-item, .attachment, .hljs, code');

import {Post as PostType} from '@mattermost/types/posts';

interface Props {

    /**
     * The post to render
     */
    post: PostType & {system_post_ids?: UserActivityPost['system_post_ids']};

    /**
     * The logged in user ID
     */
    currentUserId: string;

    /**
     * Set to center the post
     */
    center: boolean;

    /**
     * Set to render post compactly
     */
    compactDisplay: boolean;

    /**
     * Set to colorize usernames according to their hash in compact view
     */
    colorizeUsernames: boolean;

    /**
     * Set to render a preview of the parent post above this reply
     */
    isFirstReply: boolean;

    /**
     * Set to highlight the background of the post
     */
    shouldHighlight: boolean;

    /**
     * Set to render this post as if it was attached to the previous post
     */
    consecutivePostByUser: boolean;

    /**
     * Set if the previous post is a comment
     */
    previousPostIsComment: boolean;

    /*
     * Function called when the post options dropdown is opened
     */
    togglePostMenu: (opened: boolean) => void;

    /**
     * Set to render this comment as a mention
     */
    isCommentMention: boolean;

    /**
     * If the post has replies
     */
    hasReplies: boolean;

    /**
     * To Check if the current post is last in the list
     */
    isLastPost?: boolean;

    isBeingEdited: boolean;

    /**
     * Whether or not the channel that contains this post is archived
     */
    channelIsArchived: boolean;

    actions: {
        selectPost: (post: PostType) => void;
        selectPostCard: (post: PostType) => void;
        markPostAsUnread: (post: PostType, location: string) => void;
    };

    /*
     * Set to mark the post as flagged
     */
    isFlagged: boolean;

    isCollapsedThreadsEnabled?: boolean;

    clickToReply?: boolean;
}

interface State {
    dropdownOpened: boolean;
    fileDropdownOpened: boolean;
    hover: boolean;
    alt: boolean;
    a11yActive: boolean;
    ariaHidden: boolean;
    fadeOutHighlight: boolean;
}

export default class Post extends React.PureComponent<Props, State> {
    private postRef: React.RefObject<HTMLDivElement>;
    private highlightTimeout!: NodeJS.Timeout;

    constructor(props: Props) {
        super(props);

        this.postRef = React.createRef();

        this.state = {
            dropdownOpened: false,
            fileDropdownOpened: false,
            hover: false,
            alt: false,
            a11yActive: false,
            ariaHidden: true,
            fadeOutHighlight: false,
        };
    }

    componentDidMount() {
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
        if (this.state.hover) {
            this.removeKeyboardListeners();
        }

        if (this.postRef.current) {
            this.postRef.current.removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.postRef.current.removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }

        clearTimeout(this.highlightTimeout);
    }

    componentDidUpdate() {
        if (this.state.a11yActive) {
            this.postRef.current?.dispatchEvent(new Event(A11yCustomEventTypes.UPDATE));
        }
    }

    handleCommentClick = (e: React.MouseEvent) => {
        e.preventDefault();

        const post = this.props.post;
        if (!post) {
            return;
        }
        this.props.actions.selectPost(post);
    }

    handleCardClick = (post?: PostType) => {
        if (!post) {
            return;
        }
        this.props.actions.selectPostCard(post);
    }

    handlePostClick = (e: React.MouseEvent) => {
        const {post, clickToReply, isBeingEdited} = this.props;

        if (!post) {
            return;
        }

        const isSystemMessage = PostUtils.isSystemMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);

        if (
            !e.altKey &&
            clickToReply &&
            (fromAutoResponder || !isSystemMessage) &&
            isEligibleForClick(e) &&
            !isBeingEdited
        ) {
            trackEvent('crt', 'clicked_to_reply');
            this.props.actions.selectPost(post);
        }

        if (this.props.channelIsArchived || post.system_post_ids) {
            return;
        }

        if (e.altKey) {
            this.props.actions.markPostAsUnread(post, 'CENTER');
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

    handleFileDropdownOpened = (opened: boolean) => {
        this.setState({
            fileDropdownOpened: opened,
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

    getClassName = (post: Props['post'], isSystemMessage?: boolean, isMeMessage?: boolean, fromWebhook?: boolean, fromAutoResponder?: boolean, fromBot?: boolean) => {
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
        } else if (this.props.hasReplies) {
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
            sameUserClass = '';
            className += ' post--compact';
        }

        if ((this.state.dropdownOpened || this.state.fileDropdownOpened || this.state.a11yActive) && !this.props.isBeingEdited) {
            className += ' post--hovered';
        }

        if (post.is_pinned || this.props.isFlagged) {
            className += ' post--pinned-or-flagged';
        }

        if (this.props.isBeingEdited) {
            className += ' post--editing';
        }

        if (this.state.alt && !(this.props.channelIsArchived || post.system_post_ids)) {
            className += ' cursor--pointer';
        }

        return className + ' ' + sameUserClass + ' ' + rootUser + ' ' + postType + ' ' + currentUserCss;
    }

    setHover = (e: {altKey: boolean}) => {
        this.setState({
            hover: true,
            alt: e.altKey,
        });

        this.addKeyboardListeners();
    }

    unsetHover = () => {
        this.setState({
            hover: false,
            alt: false,
        });

        this.removeKeyboardListeners();
    }

    addKeyboardListeners = () => {
        document.addEventListener('keydown', this.handleAlt);
        document.addEventListener('keyup', this.handleAlt);
    }

    removeKeyboardListeners = () => {
        document.removeEventListener('keydown', this.handleAlt);
        document.removeEventListener('keyup', this.handleAlt);
    }

    handleAlt = (e: {altKey: boolean}) => {
        if (this.state.alt !== e.altKey) {
            this.setState({alt: e.altKey});
        }
    }

    handleA11yActivateEvent = () => {
        if (!this.props.isBeingEdited) {
            this.setState({
                a11yActive: true,
                ariaHidden: false,
            });
        }
    }

    handleA11yDeactivateEvent = () => {
        this.setState({
            a11yActive: false,
            ariaHidden: true,
        });
    }

    render() {
        const {
            post,
            hasReplies,
            compactDisplay,
            isCollapsedThreadsEnabled,
            isBeingEdited,
        } = this.props;

        if (!post.id) {
            return null;
        }

        const isSystemMessage = PostUtils.isSystemMessage(post);
        const isMeMessage = checkIsMeMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);
        const fromWebhook = post && PostUtils.isFromWebhook(post);
        const fromBot = post && PostUtils.isFromBot(post);

        let profilePic;
        const hideProfilePicture = this.hasSameRoot(this.props) && this.props.consecutivePostByUser && (!post.root_id && !hasReplies) && !fromBot;
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

        const postHeader = (
            <PostHeader
                post={post}
                handleCommentClick={this.handleCommentClick}
                handleCardClick={this.handleCardClick}
                handleDropdownOpened={this.handleDropdownOpened}
                compactDisplay={this.props.compactDisplay}
                colorizeUsernames={this.props.compactDisplay && this.props.colorizeUsernames}
                isFirstReply={this.props.isFirstReply}
                showTimeWithoutHover={!hideProfilePicture}
                hover={(this.state.hover || this.state.a11yActive || this.state.fileDropdownOpened) && !isBeingEdited}
                isLastPost={this.props.isLastPost}
            />
        );

        const postBody = (
            <PostBody
                post={post}
                handleCommentClick={this.handleCommentClick}
                compactDisplay={this.props.compactDisplay}
                isCommentMention={this.props.isCommentMention}
                isFirstReply={this.props.isFirstReply}
                handleFileDropdownOpened={this.handleFileDropdownOpened}
            />
        );

        const threadFooter = isCollapsedThreadsEnabled && !post.root_id && (hasReplies || post.is_following) ? <ThreadFooter threadId={post.id}/> : null;

        const slot1 = (
            <>
                {compactDisplay && postHeader}
                {postBody}
            </>
        );

        const slot2 = (
            <>
                {compactDisplay && postHeader}
                {(compactDisplay && isBeingEdited) && <div className={'clearfix'}/>}
                <EditPost/>
            </>
        );

        const showSlot = isBeingEdited ? AutoHeightSlots.SLOT2 : AutoHeightSlots.SLOT1;

        return (
            <PostContext.Provider value={{handlePopupOpened: this.handleDropdownOpened}}>
                <PostAriaLabelDiv
                    ref={this.postRef}
                    id={'post_' + post.id}
                    data-testid='postView'
                    role='listitem'
                    className={`a11y__section ${this.getClassName(post, isSystemMessage, isMeMessage, fromWebhook, fromAutoResponder, fromBot)}`}
                    tabIndex={0}
                    onMouseOver={this.setHover}
                    onMouseLeave={this.unsetHover}
                    onTouchStart={this.setHover}
                    onClick={this.handlePostClick}
                    aria-atomic={true}
                    post={post}
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
                            {!compactDisplay && postHeader}
                            <AutoHeightSwitcher
                                showSlot={showSlot}
                                slot1={slot1}
                                slot2={slot2}
                                shouldScrollIntoView={isBeingEdited}
                                onTransitionEnd={() => document.dispatchEvent(new Event(AppEvents.FOCUS_EDIT_TEXTBOX))}
                            />
                            {threadFooter}
                        </div>
                    </div>
                </PostAriaLabelDiv>
            </PostContext.Provider>
        );
    }
}
