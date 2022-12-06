// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEvent, useCallback, useEffect, useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {Posts} from 'mattermost-redux/constants/index';
import {
    isMeMessage as checkIsMeMessage,
    isPostPendingOrFailed,
} from 'mattermost-redux/utils/post_utils';

import Constants, {A11yCustomEventTypes, AppEvents, Locations} from 'utils/constants';
import * as PostUtils from 'utils/post_utils';

import {Post} from '@mattermost/types/posts';
import {Emoji} from '@mattermost/types/emojis';
import {PostPluginComponent} from 'types/store/plugins';

import FileAttachmentListContainer from 'components/file_attachment_list';
import DateSeparator from 'components/post_view/date_separator';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import PostProfilePicture from 'components/post_profile_picture';
import FailedPostOptions from 'components/post_view/failed_post_options';
import PostAriaLabelDiv from 'components/post_view/post_aria_label_div';
import PostTime from 'components/post_view/post_time';
import ReactionList from 'components/post_view/reaction_list';
import MessageWithAdditionalContent from 'components/message_with_additional_content';
import InfoSmallIcon from 'components/widgets/icons/info_small_icon';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import PostPreHeader from 'components/post_view/post_pre_header';
import EditPost from 'components/edit_post';
import AutoHeightSwitcher, {AutoHeightSlots} from 'components/common/auto_height_switcher';
import {Props as TimestampProps} from 'components/timestamp/timestamp';
import ThreadFooter from 'components/threading/channel_threads/thread_footer';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageContainer from 'components/post_view/post_message_view';
import {getDateForUnixTicks, makeIsEligibleForClick} from 'utils/utils';
import {getHistory} from 'utils/browser_history';

import {trackEvent} from 'actions/telemetry_actions';

import PostUserProfile from './user_profile';
import PostOptions from './post_options';

export type Props = {
    post: Post;
    teamId: string;
    currentUserId: string;
    compactDisplay?: boolean;
    colorizeUsernames?: boolean;
    isFlagged: boolean;
    isBusy?: boolean;
    previewCollapsed?: string;
    previewEnabled?: boolean;
    isEmbedVisible?: boolean;
    enableEmojiPicker?: boolean;
    enablePostUsernameOverride?: boolean;
    isReadOnly?: boolean;
    pluginPostTypes?: {[postType: string]: PostPluginComponent};
    channelIsArchived?: boolean;
    isConsecutivePost?: boolean;
    isLastPost?: boolean;
    recentEmojis: Emoji[];
    handleCardClick?: (post: Post) => void;
    togglePostMenu?: (opened: boolean) => void;
    channelName?: string;
    displayName: string;
    teamDisplayName?: string;
    teamName?: string;
    channelType?: string;
    a11yIndex?: number;
    isBot: boolean;
    hasReplies?: boolean;
    isFirstReply?: boolean;
    previousPostIsComment?: boolean;
    matches?: string[];
    term?: string;
    isMentionSearch?: boolean;
    location: keyof typeof Locations;
    actions: {
        markPostAsUnread: (post: Post, location: string) => void;
        emitShortcutReactToLastPostFrom: (emittedFrom: 'CENTER' | 'RHS_ROOT' | 'NO_WHERE') => void;
        setActionsMenuInitialisationState: (viewed: Record<string, boolean>) => void;
        selectPost: (post: Post) => void;
        removePost: (post: Post) => void;
        closeRightHandSide: () => void;
        selectPostCard: (post: Post) => void;
        setRhsExpanded: (rhsExpanded: boolean) => void;
    };
    timestampProps?: Partial<TimestampProps>;
    shouldHighlight?: boolean;
    isPostBeingEdited?: boolean;
    isCollapsedThreadsEnabled?: boolean;
    isMobileView: boolean;
    canReply?: boolean;
    replyCount?: number;
    isFlaggedPosts?: boolean;
    isPinnedPosts?: boolean;
    clickToReply?: boolean;
};

const PostComponent = (props: Props): JSX.Element => {
    const isSearchResultItem = (props.matches && props.matches.length > 0) || props.isMentionSearch || (props.term && props.term.length > 0);
    const isRHS = props.location === Locations.RHS_ROOT || props.location === Locations.RHS_COMMENT;
    const postRef = useRef<HTMLDivElement>(null);
    const postHeaderRef = useRef<HTMLDivElement>(null);
    const [hover, setHover] = useState(false);
    const [a11yActive, setA11y] = useState(false);
    const [dropdownOpened, setDropdownOpened] = useState(false);
    const [fileDropdownOpened, setFileDropdownOpened] = useState(false);
    const [fadeOutHighlight, setFadeOutHighlight] = useState(false);
    const [alt, setAlt] = useState(false);

    useEffect(() => {
        if (props.shouldHighlight) {
            const timer = setTimeout(() => setFadeOutHighlight(true), Constants.PERMALINK_FADEOUT);
            return () => {
                clearTimeout(timer);
            };
        }
        return undefined;
    }, [props.shouldHighlight]);

    useEffect(() => {
        if (postRef.current) {
            postRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, handleA11yActivateEvent);
            postRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, handleA11yDeactivateEvent);
            addKeyboardListeners();
        }
        if (a11yActive) {
            postRef.current?.dispatchEvent(new Event(A11yCustomEventTypes.UPDATE));
        }
    }, [hover, postRef.current]);

    useEffect(() => {
        if (hover) {
            removeKeyboardListeners();
        }

        if (postRef.current) {
            postRef.current.removeEventListener(A11yCustomEventTypes.ACTIVATE, handleA11yActivateEvent);
            postRef.current.removeEventListener(A11yCustomEventTypes.DEACTIVATE, handleA11yDeactivateEvent);
        }
    }, [hover, postRef.current]);

    const hasSameRoot = (props: Props) => {
        const post = props.post;

        if (props.isFirstReply) {
            return false;
        } else if (!post.root_id && !props.previousPostIsComment && props.isConsecutivePost) {
            return true;
        } else if (post.root_id) {
            return true;
        }

        return false;
    };

    const getChannelName = () => {
        const {post, channelType, isCollapsedThreadsEnabled, channelName} = props;
        let name: React.ReactNode = channelName;

        const isDirectMessage = channelType === Constants.DM_CHANNEL;
        const isPartOfThread = isCollapsedThreadsEnabled && (post.reply_count > 0 || post.is_following);

        if (isDirectMessage && isPartOfThread) {
            name = (
                <FormattedMessage
                    id='search_item.thread_direct'
                    defaultMessage='Thread in Direct Message with {username}'
                    values={{
                        username: props.displayName,
                    }}
                />
            );
        } else if (isPartOfThread) {
            name = (
                <FormattedMessage
                    id='search_item.thread'
                    defaultMessage='Thread in {channel}'
                    values={{
                        channel: channelName,
                    }}
                />
            );
        } else if (isDirectMessage) {
            name = (
                <FormattedMessage
                    id='search_item.direct'
                    defaultMessage='Direct Message (with {username})'
                    values={{
                        username: props.displayName,
                    }}
                />
            );
        }

        return name;
    };

    const getClassName = () => {
        const post = props.post;
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const isMeMessage = checkIsMeMessage(post);
        const hovered =
            fileDropdownOpened || dropdownOpened || a11yActive || isPostBeingEdited;
        return classNames('a11y__section post', {
            'post--highlight': props.shouldHighlight && !fadeOutHighlight,
            'same--root': hasSameRoot(props),
            'post--bot': PostUtils.isFromBot(post),
            'post--editing': props.isPostBeingEdited,
            'current--user': props.currentUserId === post.user_id,
            'post--system': isSystemMessage || isMeMessage,
            'post--root': props.hasReplies && !(post.root_id && post.root_id.length > 0),
            'post--comment': post.root_id && post.root_id.length > 0 && !props.isCollapsedThreadsEnabled,
            'post--compact': props.compactDisplay,
            'post--hovered': hovered,
            'same--user': props.isConsecutivePost,
            'cursor--pointer': alt && !props.channelIsArchived,
            'post--hide-controls': post.failed || post.state === Posts.POST_DELETED,
            'post--comment same--root': PostUtils.fromAutoResponder(post),
            'post--pinned-or-flagged': (post.is_pinned || props.isFlagged) && props.location === Locations.CENTER,
        });
    };

    const handleAlt = (e: KeyboardEvent) => {
        if (alt !== e.altKey) {
            setAlt(e.altKey);
        }
    };

    const handleFileDropdownOpened = useCallback((open: boolean) => setFileDropdownOpened(open), []);

    const handleDropdownOpened = useCallback((opened: boolean) => {
        if (props.togglePostMenu) {
            props.togglePostMenu(opened);
        }
        setDropdownOpened(opened);
    }, []);

    const handleMouseOver = (e: MouseEvent<HTMLDivElement>) => {
        setHover(true);
        setAlt(e.altKey);
    };

    const handleMouseLeave = () => {
        setHover(false);
        setAlt(false);
    };

    const addKeyboardListeners = () => {
        document.addEventListener('keydown', handleAlt);
        document.addEventListener('keyup', handleAlt);
    };

    const removeKeyboardListeners = () => {
        document.removeEventListener('keydown', handleAlt);
        document.removeEventListener('keyup', handleAlt);
    };

    const handleA11yActivateEvent = () => setA11y(true);

    const handleA11yDeactivateEvent = () => setA11y(false);

    // When adding clickable targets within a root post to exclude from post's on click to open thread,
    // please add to/maintain the selector below
    const isEligibleForClick = makeIsEligibleForClick('.post-image__column, .embed-responsive-item, .attachment, .hljs, code');

    const handlePostClick = (e: MouseEvent<HTMLDivElement>) => {
        const {post, clickToReply, isPostBeingEdited} = props;

        if (!post || props.channelIsArchived) {
            return;
        }

        const isSystemMessage = PostUtils.isSystemMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);

        if (
            !e.altKey &&
            clickToReply &&
            (fromAutoResponder || !isSystemMessage) &&
            isEligibleForClick(e) &&
            !isPostBeingEdited
        ) {
            trackEvent('crt', 'clicked_to_reply');
            props.actions.selectPost(post);
        }

        if (e.altKey) {
            props.actions.markPostAsUnread(props.post, props.location);
        }
    };

    const handleJumpClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (props.isMobileView) {
            props.actions.closeRightHandSide();
        }

        props.actions.setRhsExpanded(false);
        getHistory().push(`/${props.teamName}/pl/${props.post.id}`);
    };

    const handleCommentClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();

        if (!props.post) {
            return;
        }
        props.actions.selectPost(props.post);
    }, [props.post]);

    const {
        post,
        isPostBeingEdited,
    } = props;

    const isSystemMessage = PostUtils.isSystemMessage(post);
    const postClass = classNames('post__body', {'post--edited': PostUtils.isEdited(props.post), 'search-item-snippet': isSearchResultItem});

    let visibleMessage = null;

    if (isSystemMessage && props.isBot) {
        visibleMessage = (
            <span className='post__visibility'>
                <FormattedMessage
                    id='post_info.message.visible'
                    defaultMessage='(Only visible to you)'
                />
            </span>
        );
    } else if (isSystemMessage) {
        visibleMessage = (
            <span className='post__visibility'>
                <FormattedMessage
                    id='post_info.message.visible'
                    defaultMessage='(Only visible to you)'
                />
            </span>
        );
    }

    const message = isSearchResultItem ? (
        <PostBodyAdditionalContent
            post={post}
            options={{
                searchTerm: props.term,
                searchMatches: props.matches,
            }}
        >
            <PostMessageContainer
                post={post}
                options={{
                    searchTerm: props.term,
                    searchMatches: props.matches,
                    mentionHighlight: props.isMentionSearch,
                }}
                isRHS={isRHS}
            />
        </PostBodyAdditionalContent>
    ) : (
        <MessageWithAdditionalContent
            post={post}
            isEmbedVisible={props.isEmbedVisible}
            pluginPostTypes={props.pluginPostTypes}
            isRHS={isRHS}
        />
    );

    const showSlot = isPostBeingEdited ? AutoHeightSlots.SLOT2 : AutoHeightSlots.SLOT1;
    const threadFooter = props.location !== Locations.RHS_ROOT && props.isCollapsedThreadsEnabled && !post.root_id && (props.hasReplies || post.is_following) ? <ThreadFooter threadId={post.id}/> : null;
    const currentPostDay = getDateForUnixTicks(post.create_at);
    const channelDisplayName = getChannelName();

    const getTestId = () => {
        let idPrefix: string;
        switch (props.location) {
        case 'CENTER':
            idPrefix = 'post';
            break;
        case 'RHS_ROOT':
        case 'RHS_COMMENT':
            idPrefix = 'rhsPost';
            break;
        case 'SEARCH':
            idPrefix = 'searchResult';
            break;

        default:
            idPrefix = 'post';
        }

        return idPrefix + `_${props.post.id}`;
    };

    return (
        <div
            className={isSearchResultItem ? 'search-item__container' : ''}
        >
            {isSearchResultItem && <DateSeparator date={currentPostDay}/>}
            <PostAriaLabelDiv
                ref={postRef}
                role='listitem'
                id={getTestId()}
                data-testid='postView'
                tabIndex={-1}
                post={post}
                className={getClassName()}
                onClick={handlePostClick}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
                data-a11y-sort-order={props.a11yIndex}
            >
                {isSearchResultItem &&
                    <div
                        className='search-channel__name__container'
                        data-testid='search-item-container'
                        aria-hidden='true'
                    >
                        <span className='search-channel__name'>
                            {channelDisplayName}
                        </span>
                        {props.channelIsArchived &&
                        <span className='search-channel__archived'>
                            <ArchiveIcon className='icon icon__archive channel-header-archived-icon svg-text-color'/>
                            <FormattedMessage
                                id='search_item.channelArchived'
                                defaultMessage='Archived'
                            />
                        </span>
                        }
                        {Boolean(props.teamDisplayName) &&
                        <span className='search-team__name'>
                            {props.teamDisplayName}
                        </span>
                        }
                    </div>
                }
                <PostPreHeader
                    isFlagged={props.isFlagged}
                    isPinned={post.is_pinned}
                    skipPinned={props.isPinnedPosts}
                    skipFlagged={props.isFlaggedPosts}
                    channelId={post.channel_id}
                />
                <div
                    role='application'
                    className='post__content'
                    data-testid='postContent'
                >
                    <div className='post__img'>
                        <PostProfilePicture
                            compactDisplay={props.compactDisplay}
                            isBusy={props.isBusy}
                            isRHS={isRHS}
                            post={post}
                            userId={post.user_id}
                        />
                    </div>
                    <div>
                        <div
                            className='post__header'
                            ref={postHeaderRef}
                        >
                            <PostUserProfile
                                {...props}
                                isSystemMessage={isSystemMessage}
                            />
                            <div className='col'>
                                {
                                    <PostTime
                                        isPermalink={!(Posts.POST_DELETED === post.state || isPostPendingOrFailed(post))}
                                        eventTime={post.create_at}
                                        postId={post.id}
                                        location={Locations.RHS_COMMENT}
                                        timestampProps={{...props.timestampProps, style: props.isConsecutivePost && !props.compactDisplay ? 'narrow' : undefined}}
                                    />
                                }
                                {post.props && post.props.card &&
                                <OverlayTrigger
                                    delayShow={Constants.OVERLAY_TIME_DELAY}
                                    placement='top'
                                    overlay={
                                        <Tooltip>
                                            <FormattedMessage
                                                id='post_info.info.view_additional_info'
                                                defaultMessage='View additional info'
                                            />
                                        </Tooltip>
                                    }
                                >
                                    <button
                                        className='card-icon__container icon--show style--none'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            props.handleCardClick?.(props.post);
                                        }}
                                    >
                                        <InfoSmallIcon
                                            className='icon icon__info'
                                            aria-hidden='true'
                                        />
                                    </button>
                                </OverlayTrigger>
                                }
                                {visibleMessage}
                            </div>
                            {!isPostBeingEdited &&
                            <PostOptions
                                {...props}
                                setActionsMenuInitialisationState={props.actions.setActionsMenuInitialisationState}
                                handleDropdownOpened={handleDropdownOpened}
                                handleCommentClick={handleCommentClick}
                                hover={hover}
                                removePost={props.actions.removePost}
                                isSearchResultsItem={Boolean(isSearchResultItem)}
                                handleJumpClick={handleJumpClick}
                            />
                            }
                        </div>
                        <div
                            className={postClass}
                            id={props.location === Locations.RHS_ROOT ? `rhsPostMessageText_${post.id}` : `postMessageText_${post.id}`}
                        >
                            {post.failed && <FailedPostOptions post={props.post}/>}
                            <AutoHeightSwitcher
                                showSlot={showSlot}
                                shouldScrollIntoView={isPostBeingEdited}
                                slot1={message}
                                slot2={<EditPost/>}
                                onTransitionEnd={() => document.dispatchEvent(new Event(AppEvents.FOCUS_EDIT_TEXTBOX))}
                            />
                            {post.file_ids && post.file_ids.length > 0 &&
                            <FileAttachmentListContainer
                                post={post}
                                compactDisplay={props.compactDisplay}
                                handleFileDropdownOpened={handleFileDropdownOpened}
                            />
                            }
                            <ReactionList
                                post={post}
                            />
                            {threadFooter}
                        </div>
                    </div>
                </div>
            </PostAriaLabelDiv>
        </div>
    );
};

export default PostComponent;
