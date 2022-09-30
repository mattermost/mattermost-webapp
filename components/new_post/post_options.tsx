// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {ReactNode, useRef, useState} from 'react';

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

type Props = {
    post: Post;
    teamId: string;
    isFlagged: boolean;
    removePost: (post: Post) => void;
    enableEmojiPicker: boolean;
    isReadOnly: boolean;
    channelIsArchived?: boolean;
    setActionsMenuInitialisationState: (initializationState: Record<string, boolean>) => void;
    collapsedThreadsEnabled?: boolean;
    shouldShowActionsMenu?: boolean;
    showActionsMenuPulsatingDot?: boolean;
    oneClickReactionsEnabled?: boolean;
    recentEmojis: Emoji[];
    isExpanded?: boolean;
    hover?: boolean;
    isMobileView: boolean;
    a11yActive?: boolean;
};

const PostOptions = (props: Props): JSX.Element => {
    const dotMenuRef = useRef<HTMLDivElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showDotMenu, setShowDotMenu] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showActionTip, setShowActionTip] = useState(false);
    console.log(props, showDotMenu, showActionsMenu);
    const {
        channelIsArchived,
        collapsedThreadsEnabled,
        isMobileView,
        isReadOnly,
        post,
        hover,
        oneClickReactionsEnabled,
        showActionsMenuPulsatingDot,
        a11yActive,
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

    const handleDotMenuOpened = () => setShowDotMenu(true);

    const handleActionsMenuOpened = (open: boolean) => {
        if (showActionsMenuPulsatingDot) {
            setShowActionTip(true);
            return;
        }
        setShowActionsMenu(open);
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

    const showRecentlyUsedReactions = (!isReadOnly && !isEphemeral && !post.failed && !isSystemMessage && !channelIsArchived && oneClickReactionsEnabled && props.enableEmojiPicker);
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
        hover ||
        a11yActive ||
        showDotMenu ||
        showActionsMenu ||
        showActionTip ||
        showEmojiPicker)) {
        const showActionsMenuIcon = props.shouldShowActionsMenu && (isMobile || hover);
        const actionsMenu = showActionsMenuIcon && (
            <ActionsMenu
                post={post}
                location={Locations.RHS_COMMENT}
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
                location={Locations.RHS_COMMENT}
                isFlagged={props.isFlagged}
                handleDropdownOpened={handleDotMenuOpened}
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
                {!isReadOnly && !isEphemeral && !post.failed && !isSystemMessage && props.enableEmojiPicker && !channelIsArchived &&
                <PostReaction
                    channelId={post.channel_id}
                    postId={post.id}
                    teamId={props.teamId}
                    getDotMenuRef={getDotMenuRef}
                    location={Locations.RHS_COMMENT}
                    showEmojiPicker={showEmojiPicker}
                    toggleEmojiPicker={toggleEmojiPicker}
                />}
                {flagIcon}
                {actionsMenu}
                {(collapsedThreadsEnabled || showRecentlyUsedReactions) && dotMenu}
            </div>
        );
    }

    return <>{options}</>;
};

export default PostOptions;
