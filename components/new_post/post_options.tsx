// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {ReactNode, useRef, useState} from 'react';

import {FormattedMessage} from 'react-intl';

import {Posts, Preferences} from 'mattermost-redux/constants/index';
import {isPostEphemeral} from 'mattermost-redux/utils/post_utils';

import {Locations} from 'utils/constants';
import * as PostUtils from 'utils/post_utils';
import {isMobile} from 'utils/utils';

import {Post} from '@mattermost/types/posts';
import {Emoji} from '@mattermost/types/emojis';

import ActionsMenu from 'components/actions_menu';
import DotMenu from 'components/dot_menu';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostRecentReactions from 'components/post_view/post_recent_reactions';
import PostReaction from 'components/post_view/post_reaction';
import CommentIcon from 'components/common/comment_icon';

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
    oneClickReactionsEnabled?: boolean;
    recentEmojis: Emoji[];
    isExpanded?: boolean;
    hover?: boolean;
    isMobileView: boolean;
    a11yActive?: boolean;
    hasReplies?: boolean;
    isFirstReply?: boolean;
    isSearchResultsItem?: boolean;
    canReply?: boolean;
    replyCount?: number;
    location: 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT' | string;
};

const PostOptions = (props: Props): JSX.Element => {
    const dotMenuRef = useRef<HTMLDivElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showDotMenu, setShowDotMenu] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showOptionsMenuWithoutHover, setShowOptionsMenuWithoutHover] = useState(false);
    const [showActionTip, setShowActionTip] = useState(false);

    const {
        channelIsArchived,
        collapsedThreadsEnabled,
        isReadOnly,
        post,
        oneClickReactionsEnabled,
        showActionsMenuPulsatingDot,
        a11yActive,
        isMobileView,
    } = props;

    const removePost = () => props.removePost(props.post);

    const createRemovePostButton = () => {
        return (
            <button
                className='post__remove theme color--link style--none'
                type='button'
                onClick={removePost}
            >
                {'×'}
            </button>
        );
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleDotMenuOpened = (open: boolean) => {
        setShowDotMenu(open);
        props.handleDropdownOpened!(open || showEmojiPicker);
    };

    const handleActionsMenuOpened = (open: boolean) => {
        if (showActionsMenuPulsatingDot) {
            setShowActionTip(true);
            return;
        }
        setShowActionsMenu(open);
        props.handleDropdownOpened!(open);
    };

    const handleActionsMenuTipOpened = () => setShowActionTip(true);

    const handleActionsMenuGotItClick = () => {
        props.setActionsMenuInitialisationState?.(({[Preferences.ACTIONS_MENU_VIEWED]: true}));
        setShowActionTip(false);
    };

    const handleTipDismissed = () => setShowActionTip(false);

    const getDotMenuRef = () => dotMenuRef.current;

    const isPostDeleted = post && post.state === Posts.POST_DELETED;
    const isEphemeral = isPostEphemeral(post);
    const isSystemMessage = PostUtils.isSystemMessage(post);

    const hoverLocal = props.hover || showEmojiPicker || showDotMenu || showActionsMenu || showActionTip || showOptionsMenuWithoutHover;

    const showCommentIcon = !isSystemMessage && (isMobile || hoverLocal || (!post.root_id && Boolean(props.hasReplies)) || props.isFirstReply || props.canReply);
    const commentIconExtraClass = isMobileView ? '' : 'pull-right';

    let commentIcon;
    if (showCommentIcon) {
        commentIcon = (
            <CommentIcon
                handleCommentClick={props.handleCommentClick}
                postId={post.id}
                extraClass={commentIconExtraClass}
                commentCount={props.replyCount}
            />
        );
    }

    const showRecentlyUsedReactions = (!isReadOnly && !isEphemeral && !post.failed && !isSystemMessage && !channelIsArchived && oneClickReactionsEnabled && props.enableEmojiPicker && hoverLocal);

    let showRecentReactions: ReactNode;
    if (showRecentlyUsedReactions) {
        showRecentReactions = (
            <PostRecentReactions
                channelId={post.channel_id}
                postId={post.id}
                teamId={props.teamId}
                emojis={props.recentEmojis}
                getDotMenuRef={getDotMenuRef}
                size={props.isExpanded ? 3 : 1}
            />
        );
    }

    const showReactionIcon = !isSystemMessage && !isReadOnly && !isEphemeral && !post.failed && props.enableEmojiPicker;
    let postReaction;
    if (showReactionIcon) {
        postReaction = (
            <PostReaction
                channelId={post.channel_id}
                postId={post.id}
                teamId={props.teamId}
                getDotMenuRef={getDotMenuRef}
                showEmojiPicker={showEmojiPicker}
                toggleEmojiPicker={toggleEmojiPicker}
            />
        );
    }

    let flagIcon: ReactNode = null;
    if (!isMobileView && (!isEphemeral && !post.failed && !isSystemMessage)) {
        flagIcon = (
            <PostFlagIcon
                location={Locations.RHS_COMMENT}
                postId={post.id}
                isFlagged={props.isFlagged}
            />
        );
    }

    let options: ReactNode;
    if (isEphemeral) {
        options = (
            <div className='col col__remove'>
                {createRemovePostButton()}
            </div>
        );
    } else if (isPostDeleted) {
        options = null;
    } else if (!isSystemMessage &&
        (isMobileView ||
        hoverLocal ||
        a11yActive)) {
        const showActionsMenuIcon = props.shouldShowActionsMenu && (isMobile || hoverLocal);
        const actionsMenu = showActionsMenuIcon && (
            <ActionsMenu
                post={post}
                location={props.location}
                handleDropdownOpened={handleActionsMenuOpened}
                isMenuOpen={showActionsMenu}
                showPulsatingDot={showActionsMenuPulsatingDot}
                showTutorialTip={showActionTip}
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
                {(collapsedThreadsEnabled || showRecentlyUsedReactions) && dotMenu}
                {commentIcon}
                {props.isSearchResultsItem &&
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
                }
            </div>
        );
    }

    return <>{options}</>;
};

export default PostOptions;
