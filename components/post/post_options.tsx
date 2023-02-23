// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useEffect, useRef, useState} from 'react';

import {FormattedMessage} from 'react-intl';

import {Posts, Preferences} from 'mattermost-redux/constants/index';
import {isPostEphemeral} from 'mattermost-redux/utils/post_utils';

import {Locations} from 'utils/constants';
import {isSystemMessage, fromAutoResponder} from 'utils/post_utils';
import ActionsMenu from 'components/actions_menu';
import DotMenu from 'components/dot_menu';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostRecentReactions from 'components/post_view/post_recent_reactions';
import PostReaction from 'components/post_view/post_reaction';
import CommentIcon from 'components/common/comment_icon';

import {Emoji} from '@mattermost/types/emojis';
import {Post} from '@mattermost/types/posts';

type Props = {
    post: Post;
    teamId: string;
    isFlagged: boolean;
    removePost: (post: Post) => void;
    enableEmojiPicker?: boolean;
    isReadOnly?: boolean;
    channelIsArchived?: boolean;
    setActionsMenuInitialisationState: (initializationState: Record<string, boolean>) => void;
    handleCommentClick?: (e: React.MouseEvent) => void;
    handleJumpClick?: (e: React.MouseEvent) => void;
    handleDropdownOpened?: (e: boolean) => void;
    collapsedThreadsEnabled?: boolean;
    shouldShowActionsMenu?: boolean;
    showActionsMenuPulsatingDot?: boolean;
    tourTipsEnabled: boolean;
    oneClickReactionsEnabled?: boolean;
    recentEmojis: Emoji[];
    isExpanded?: boolean;
    hover?: boolean;
    isMobileView: boolean;
    hasReplies?: boolean;
    isFirstReply?: boolean;
    isSearchResultsItem?: boolean;
    canReply?: boolean;
    replyCount?: number;
    location: keyof typeof Locations;
    isLastPost?: boolean;
    shortcutReactToLastPostEmittedFrom?: string;
    isPostHeaderVisible?: boolean | null;
    isPostBeingEdited?: boolean;
    shouldShowDotMenu: boolean;
    actions: {
        emitShortcutReactToLastPostFrom: (emittedFrom: 'CENTER' | 'RHS_ROOT' | 'NO_WHERE') => void;
    };
};

const PostOptions = (props: Props): JSX.Element => {
    const dotMenuRef = useRef<HTMLDivElement>(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showDotMenu, setShowDotMenu] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showActionTip, setShowActionTip] = useState(false);

    useEffect(() => {
        if (props.isLastPost &&
            (props.shortcutReactToLastPostEmittedFrom === props.location) &&
                props.isPostHeaderVisible) {
            toggleEmojiPicker();
            props.actions.emitShortcutReactToLastPostFrom(Locations.NO_WHERE);
        }
    }, [props.isLastPost, props.shortcutReactToLastPostEmittedFrom]);

    const {
        channelIsArchived,
        collapsedThreadsEnabled,
        isReadOnly,
        post,
        oneClickReactionsEnabled,
        showActionsMenuPulsatingDot,
        tourTipsEnabled,
        isMobileView,
    } = props;

    const isEphemeral = isPostEphemeral(post);
    const systemMessage = isSystemMessage(post);
    const isFromAutoResponder = fromAutoResponder(post);

    const removePost = () => props.removePost(props.post);

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
        props.handleDropdownOpened!(!showEmojiPicker);
    };

    const handleDotMenuOpened = (open: boolean) => {
        setShowDotMenu(open);
        props.handleDropdownOpened!(open);
    };

    const handleActionsMenuOpened = (open: boolean) => {
        if (tourTipsEnabled && showActionsMenuPulsatingDot) {
            setShowActionTip(true);
            return;
        }
        setShowActionsMenu(open);
        props.handleDropdownOpened!(open);
    };

    const handleActionsMenuTipOpened = () => {
        setShowActionTip(true);
        props.handleDropdownOpened!(true);
    };

    const handleActionsMenuGotItClick = () => {
        props.setActionsMenuInitialisationState?.(({[Preferences.ACTIONS_MENU_VIEWED]: true}));
        setShowActionTip(false);
        props.handleDropdownOpened!(false);
    };

    const handleTipDismissed = () => {
        setShowActionTip(false);
        props.handleDropdownOpened!(false);
    };

    const getDotMenuRef = () => dotMenuRef.current;

    const isPostDeleted = post && post.state === Posts.POST_DELETED;
    const hoverLocal = props.hover || showEmojiPicker || showDotMenu || showActionsMenu || showActionTip;
    const showCommentIcon = isFromAutoResponder || (!systemMessage && (isMobileView ||
            hoverLocal || (!post.root_id && Boolean(props.hasReplies)) ||
            props.isFirstReply) && props.location === Locations.CENTER);
    const commentIconExtraClass = isMobileView ? '' : 'pull-right';

    let commentIcon;
    if (showCommentIcon) {
        commentIcon = (
            <CommentIcon
                handleCommentClick={props.handleCommentClick}
                postId={post.id}
                extraClass={commentIconExtraClass}
                commentCount={props.collapsedThreadsEnabled ? 0 : props.replyCount}
            />
        );
    }

    const showRecentlyUsedReactions = (!isMobileView && !isReadOnly && !isEphemeral && !post.failed && !systemMessage && !channelIsArchived && oneClickReactionsEnabled && props.enableEmojiPicker && hoverLocal);

    let showRecentReactions: ReactNode;
    if (showRecentlyUsedReactions) {
        showRecentReactions = (
            <PostRecentReactions
                channelId={post.channel_id}
                postId={post.id}
                teamId={props.teamId}
                emojis={props.recentEmojis}
                size={props.isExpanded || props.location === 'CENTER' ? 3 : 1}
            />
        );
    }

    const showReactionIcon = !systemMessage && !isReadOnly && !isEphemeral && !post.failed && props.enableEmojiPicker && !channelIsArchived;
    let postReaction;
    if (showReactionIcon) {
        postReaction = (
            <PostReaction
                channelId={post.channel_id}
                location={props.location}
                postId={post.id}
                teamId={props.teamId}
                getDotMenuRef={getDotMenuRef}
                showEmojiPicker={showEmojiPicker}
                toggleEmojiPicker={toggleEmojiPicker}
            />
        );
    }

    let flagIcon: ReactNode = null;
    if (!isMobileView && (!isEphemeral && !post.failed && !systemMessage)) {
        flagIcon = (
            <PostFlagIcon
                location={props.location}
                postId={post.id}
                isFlagged={props.isFlagged}
            />
        );
    }

    // Action menus
    const showActionsMenuIcon = props.shouldShowActionsMenu && (isMobileView || hoverLocal);
    const actionsMenu = showActionsMenuIcon && (
        <ActionsMenu
            post={post}
            location={props.location}
            handleDropdownOpened={handleActionsMenuOpened}
            isMenuOpen={showActionsMenu}
            showPulsatingDot={tourTipsEnabled && showActionsMenuPulsatingDot}
            showTutorialTip={tourTipsEnabled && showActionTip}
            handleOpenTip={handleActionsMenuTipOpened}
            handleNextTip={handleActionsMenuGotItClick}
            handleDismissTip={handleTipDismissed}
        />
    );
    const dotMenu = (
        <DotMenu
            post={props.post}
            location={props.location}
            isFlagged={props.isFlagged}
            handleDropdownOpened={handleDotMenuOpened}
            handleCommentClick={props.handleCommentClick}
            handleAddReactionClick={toggleEmojiPicker}
            isReadOnly={isReadOnly || channelIsArchived}
            isMenuOpen={showDotMenu}
            enableEmojiPicker={props.enableEmojiPicker}
        />
    );

    // Build post options
    let options: ReactNode;
    if (isEphemeral) {
        options = (
            <div className='col col__remove'>
                <button
                    className='post__remove theme color--link style--none'
                    onClick={removePost}
                >
                    {'×'}
                </button>
            </div>
        );
    } else if (isPostDeleted || !props.shouldShowDotMenu) {
        options = null;
    } else if (props.location === Locations.SEARCH) {
        const hasCRTFooter = props.collapsedThreadsEnabled && !post.root_id && (post.reply_count > 0 || post.is_following);
        options = (
            <div className='col__controls post-menu'>
                {dotMenu}
                {flagIcon}
                {props.canReply && !hasCRTFooter &&
                    <CommentIcon
                        location={props.location}
                        handleCommentClick={props.handleCommentClick}
                        commentCount={props.replyCount}
                        postId={post.id}
                        searchStyle={'search-item__comment'}
                        extraClass={props.replyCount ? 'icon--visible' : ''}
                    />
                }
                <a
                    href='#'
                    onClick={props.handleJumpClick}
                    className='search-item__jump'
                >
                    <FormattedMessage
                        id='search_item.jump'
                        defaultMessage='Jump'
                    />
                </a>
            </div>
        );
    } else if (!props.isPostBeingEdited) {
        options = (
            <div
                ref={dotMenuRef}
                data-testid={`post-menu-${props.post.id}`}
                className='col post-menu'
            >
                {!collapsedThreadsEnabled && !showRecentlyUsedReactions && dotMenu}
                {showRecentReactions}
                {postReaction}
                {flagIcon}
                {actionsMenu}
                {commentIcon}
                {(collapsedThreadsEnabled || showRecentlyUsedReactions) && dotMenu}
            </div>
        );
    }

    return <>{options}</>;
};

export default PostOptions;
