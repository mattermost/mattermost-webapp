// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, RefObject} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {Posts, Preferences} from 'mattermost-redux/constants/index';
import {
    isMeMessage as checkIsMeMessage,
    isPostEphemeral,
    isPostPendingOrFailed,
} from 'mattermost-redux/utils/post_utils';

import Constants, {A11yCustomEventTypes, AppEvents, Locations} from 'utils/constants';
import * as PostUtils from 'utils/post_utils';
import {isMobile} from 'utils/utils';

import {Post} from '@mattermost/types/posts';
import {Emoji} from '@mattermost/types/emojis';
import {PostPluginComponent} from 'types/store/plugins';

import ActionsMenu from 'components/actions_menu';
import DotMenu from 'components/dot_menu';
import FileAttachmentListContainer from 'components/file_attachment_list';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import PostProfilePicture from 'components/post_profile_picture';
import FailedPostOptions from 'components/post_view/failed_post_options';
import PostAriaLabelDiv from 'components/post_view/post_aria_label_div';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostTime from 'components/post_view/post_time';
import PostRecentReactions from 'components/post_view/post_recent_reactions';
import PostReaction from 'components/post_view/post_reaction';
import ReactionList from 'components/post_view/reaction_list';
import MessageWithAdditionalContent from 'components/message_with_additional_content';
import BotBadge from 'components/widgets/badges/bot_badge';
import Badge from 'components/widgets/badges/badge';
import InfoSmallIcon from 'components/widgets/icons/info_small_icon';
import PostPreHeader from 'components/post_view/post_pre_header';
import UserProfile from 'components/user_profile';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import EditPost from 'components/edit_post';
import AutoHeightSwitcher, {AutoHeightSlots} from 'components/common/auto_height_switcher';
import {Props as TimestampProps} from 'components/timestamp/timestamp';

type Props = {
    post: Post;
    teamId: string;
    currentUserId: string;
    compactDisplay?: boolean;
    colorizeUsernames?: boolean;
    isFlagged: boolean;
    isBusy?: boolean;
    removePost: (post: Post) => void;
    previewCollapsed: string;
    previewEnabled: boolean;
    isEmbedVisible?: boolean;
    enableEmojiPicker: boolean;
    enablePostUsernameOverride: boolean;
    isReadOnly: boolean;
    pluginPostTypes?: {[postType: string]: PostPluginComponent};
    channelIsArchived?: boolean;
    isConsecutivePost?: boolean;
    handleCardClick?: (post: Post) => void;
    a11yIndex?: number;

    /**
     * If the user that made the post is a bot.
     */
    isBot: boolean;

    /**
     * To Check if the current post is last in the list of RHS
     */
    isLastPost?: boolean;

    /**
     * To check if the state of emoji for last message and from where it was emitted
     */
    shortcutReactToLastPostEmittedFrom?: string;
    actions: {
        markPostAsUnread: (post: Post, location: string) => void;

        /**
         * Function to set or unset emoji picker for last message
         */
        emitShortcutReactToLastPostFrom: (emittedFrom: 'CENTER' | 'RHS_ROOT' | 'NO_WHERE') => void;

        /**
         * Function to set viewed Actions Menu for first time
         */
        setActionsMenuInitialisationState: (initializationState: Record<string, boolean>) => void;
    };
    timestampProps?: Partial<TimestampProps>;
    collapsedThreadsEnabled?: boolean;

    shouldShowActionsMenu?: boolean;

    /**
     * true when want to show the Actions Menu with pulsating dot for tutorial
     */
    showActionsMenuPulsatingDot?: boolean;

    /**
     * To Check if the current post is to be highlighted and scrolled into center view of RHS
     */
    shouldHighlight?: boolean;

    oneClickReactionsEnabled?: boolean;
    recentEmojis: Emoji[];

    isExpanded?: boolean;

    /**
     * check if the current post is being edited at the moment
     */
    isPostBeingEdited?: boolean;
    isMobileView: boolean;
};

type State = {
    showEmojiPicker: boolean;
    showDotMenu: boolean;
    showActionsMenu: boolean;
    showActionTip: boolean;
    fileDropdownOpened: boolean;
    alt: boolean;
    hover: boolean;
    a11yActive: boolean;
    currentAriaLabel: string;
}

export default class RhsComment extends React.PureComponent<Props, State> {
    postRef: RefObject<HTMLDivElement>;
    dotMenuRef: RefObject<HTMLDivElement>;
    postHeaderRef: RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.postRef = React.createRef();
        this.dotMenuRef = React.createRef();

        this.state = {
            showEmojiPicker: false,
            showDotMenu: false,
            showActionsMenu: false,
            showActionTip: false,
            fileDropdownOpened: false,
            alt: false,
            hover: false,
            a11yActive: false,
            currentAriaLabel: '',
        };

        this.postHeaderRef = React.createRef();
    }

    componentDidMount() {
        if (this.postRef.current) {
            this.postRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.postRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
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
    }

    componentDidUpdate(prevProps: Props) {
        const {shortcutReactToLastPostEmittedFrom, isLastPost} = this.props;

        if (this.state.a11yActive) {
            this.postRef.current?.dispatchEvent(new Event(A11yCustomEventTypes.UPDATE));
        }

        const shortcutReactToLastPostEmittedFromRHS = prevProps.shortcutReactToLastPostEmittedFrom !== shortcutReactToLastPostEmittedFrom &&
        shortcutReactToLastPostEmittedFrom === Locations.RHS_ROOT;
        if (shortcutReactToLastPostEmittedFromRHS) {
            // Opening the emoji picker when more than one post in rhs is present
            this.handleShortcutReactToLastPost(isLastPost);
        }
    }

    handleShortcutReactToLastPost = (isLastPost?: boolean) => {
        if (isLastPost) {
            const {
                channelIsArchived,
                enableEmojiPicker,
                isMobileView,
                isReadOnly,
                post,
                actions: {
                    emitShortcutReactToLastPostFrom,
                },
            } = this.props;

            // Setting the last message emoji action to empty to clean up the redux state
            emitShortcutReactToLastPostFrom(Locations.NO_WHERE);

            // Following are the types of posts on which adding reaction is not possible
            const isDeletedPost: boolean = post && post.state === Posts.POST_DELETED;
            const isEphemeralPost: boolean = post && isPostEphemeral(post);
            const isSystemMessage: boolean = post && PostUtils.isSystemMessage(post);
            const isAutoRespondersPost: boolean = post && PostUtils.fromAutoResponder(post);
            const isFailedPost: boolean | undefined = post && post.failed;

            // Checking if rhs comment is in scroll view of the user
            const boundingRectOfPostInfo: DOMRect | undefined = this.postHeaderRef.current?.getBoundingClientRect();

            let isPostHeaderVisibleToUser: boolean | null = null;
            if (boundingRectOfPostInfo) {
                isPostHeaderVisibleToUser = (boundingRectOfPostInfo.top - 110) > 0 &&
                    boundingRectOfPostInfo.bottom < (window.innerHeight);
            }

            if (isPostHeaderVisibleToUser && !isEphemeralPost && !isSystemMessage && !isReadOnly && !isFailedPost &&
                !isAutoRespondersPost && !isDeletedPost && !channelIsArchived && !isMobileView && enableEmojiPicker) {
                this.setState({hover: true}, () => {
                    this.toggleEmojiPicker();
                });
            }
        }
    }

    removePost = () => this.props.removePost(this.props.post);

    createRemovePostButton = () => {
        return (
            <button
                className='post__remove theme color--link style--none'
                type='button'
                onClick={this.removePost}
            >
                {'×'}
            </button>
        );
    };

    renderPostTime = () => {
        const post = this.props.post;

        const isPermalink = !(Posts.POST_DELETED === post.state || isPostPendingOrFailed(post));

        return (
            <PostTime
                isPermalink={isPermalink}
                eventTime={post.create_at}
                postId={post.id}
                location={Locations.RHS_COMMENT}
                timestampProps={{...this.props.timestampProps, style: this.props.isConsecutivePost && !this.props.compactDisplay ? 'narrow' : undefined}}
            />
        );
    };

    toggleEmojiPicker = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        e?.stopPropagation();
        const showEmojiPicker = !this.state.showEmojiPicker;
        this.setState({
            showEmojiPicker,
        });
    };

    getClassName = (post: Post, isSystemMessage: boolean, isMeMessage: boolean) => {
        const hovered = this.state.showDotMenu ||
            this.state.showActionsMenu ||
            this.state.showActionTip ||
            this.state.fileDropdownOpened ||
            this.state.showEmojiPicker;

        return classNames('a11y__section post post--thread same--root post--comment', {
            'post--highlight': this.props.shouldHighlight,
            'post--editing': this.props.isPostBeingEdited,
            'current--user': this.props.currentUserId === post.user_id,
            'post--system': isSystemMessage || isMeMessage,
            'post--compact': this.props.compactDisplay,
            'post--hovered': hovered,
            'same--user': this.props.isConsecutivePost,
            'cursor--pointer': this.state.alt && !this.props.channelIsArchived,
        });
    };

    handleAlt = (e: KeyboardEvent) => {
        if (this.state.alt !== e.altKey) {
            this.setState({alt: e.altKey});
        }
    }

    handleDotMenuOpened = (open: boolean) => this.setState({showDotMenu: open});

    handleFileDropdownOpened = (open: boolean) => this.setState({fileDropdownOpened: open});

    handleActionsMenuOpened = (open: boolean) => {
        if (this.props.showActionsMenuPulsatingDot) {
            this.setState({showActionTip: true});
            return;
        }
        this.setState({showActionsMenu: open});
    };

    handleActionsMenuTipOpened = () => this.setState({showActionTip: true});

    handleActionsMenuGotItClick = () => {
        this.props.actions.setActionsMenuInitialisationState?.(({[Preferences.ACTIONS_MENU_VIEWED]: true}));
        this.setState({showActionTip: false});
    };

    handleTipDismissed = () => this.setState({showActionTip: false});

    getDotMenuRef = () => this.dotMenuRef.current;

    setHover = (e: React.MouseEvent<HTMLDivElement>) => {
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

    handleA11yActivateEvent = () => this.setState({a11yActive: true});

    handleA11yDeactivateEvent = () => this.setState({a11yActive: false});

    handlePostClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (this.props.channelIsArchived) {
            return;
        }

        if (e.altKey) {
            this.props.actions.markPostAsUnread(this.props.post, 'RHS_COMMENT');
        }
    }

    render() {
        const {
            channelIsArchived,
            collapsedThreadsEnabled,
            isConsecutivePost,
            isMobileView,
            isReadOnly,
            post,
            isPostBeingEdited,
        } = this.props;

        const isPostDeleted = post && post.state === Posts.POST_DELETED;
        const isEphemeral = isPostEphemeral(post);
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const isMeMessage = checkIsMeMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);
        const colorize = this.props.compactDisplay && this.props.colorizeUsernames;

        let botIndicator: ReactNode;
        let profilePicture: ReactNode;
        let visibleMessage: ReactNode;

        let userProfile: ReactNode = null;
        if (this.props.compactDisplay || isMobileView) {
            userProfile = (
                <UserProfile
                    userId={post.user_id}
                    channelId={post.channel_id}
                    isBusy={this.props.isBusy}
                    isRHS={true}
                    hasMention={true}
                    colorize={colorize}
                />
            );
        }

        if (!isConsecutivePost) {
            userProfile = (
                <UserProfile
                    userId={post.user_id}
                    channelId={post.channel_id}
                    isBusy={this.props.isBusy}
                    isRHS={true}
                    hasMention={true}
                    colorize={colorize}
                />
            );

            profilePicture = (
                <PostProfilePicture
                    compactDisplay={this.props.compactDisplay}
                    isBusy={this.props.isBusy}
                    isRHS={true}
                    post={post}
                    userId={post.user_id}
                />
            );

            if (post.props && post.props.from_webhook) {
                const overwriteName = post.props.override_username && this.props.enablePostUsernameOverride ? post.props.override_username : undefined;
                userProfile = (
                    <UserProfile
                        userId={post.user_id}
                        channelId={post.channel_id}
                        hideStatus={true}
                        overwriteName={overwriteName}
                        disablePopover={true}
                        colorize={colorize}
                    />
                );

                botIndicator = (<BotBadge className='col col__name'/>);
            } else if (fromAutoResponder) {
                userProfile = (
                    <span className='auto-responder'>
                        <UserProfile
                            userId={post.user_id}
                            channelId={post.channel_id}
                            hideStatus={true}
                            isBusy={this.props.isBusy}
                            isRHS={true}
                            hasMention={true}
                            colorize={colorize}
                        />
                    </span>
                );
                botIndicator = (
                    <Badge className='col col__name'>
                        <FormattedMessage
                            id='post_info.auto_responder'
                            defaultMessage='AUTOMATIC REPLY'
                        />
                    </Badge>
                );
            } else if (isSystemMessage && this.props.isBot) {
                userProfile = (
                    <UserProfile
                        userId={post.user_id}
                        channelId={post.channel_id}
                        hideStatus={true}
                        colorize={colorize}
                    />
                );

                visibleMessage = (
                    <span className='post__visibility'>
                        <FormattedMessage
                            id='post_info.message.visible'
                            defaultMessage='(Only visible to you)'
                        />
                    </span>
                );
            } else if (isSystemMessage) {
                userProfile = (
                    <UserProfile
                        overwriteName={
                            <FormattedMessage
                                id='post_info.system'
                                defaultMessage='System'
                            />
                        }
                        overwriteImage={Constants.SYSTEM_MESSAGE_PROFILE_IMAGE}
                        disablePopover={true}
                        channelId={post.channel_id}
                        colorize={colorize}
                    />
                );
                visibleMessage = (
                    <span className='post__visibility'>
                        <FormattedMessage
                            id='post_info.message.visible'
                            defaultMessage='(Only visible to you)'
                        />
                    </span>
                );
            }
        }

        const failedPostOptions = post.failed ? <FailedPostOptions post={this.props.post}/> : undefined;
        const postClass = classNames('post__body', {'post--edited': PostUtils.isEdited(this.props.post)});

        let fileAttachment: ReactNode = null;
        if (post.file_ids && post.file_ids.length > 0) {
            fileAttachment = (
                <FileAttachmentListContainer
                    post={post}
                    compactDisplay={this.props.compactDisplay}
                    handleFileDropdownOpened={this.handleFileDropdownOpened}
                />
            );
        }

        const showRecentlyUsedReactions = (!isReadOnly && !isEphemeral && !post.failed && !isSystemMessage && !channelIsArchived && this.props.oneClickReactionsEnabled && this.props.enableEmojiPicker);
        let showRecentReactions: ReactNode;
        if (showRecentlyUsedReactions) {
            showRecentReactions = (
                <PostRecentReactions
                    channelId={post.channel_id}
                    postId={post.id}
                    teamId={this.props.teamId}
                    emojis={this.props.recentEmojis}
                    getDotMenuRef={this.getDotMenuRef}
                    size={this.props.isExpanded ? 3 : 1}
                />
            );
        }

        let postReaction: ReactNode;
        if (!isReadOnly && !isEphemeral && !post.failed && !isSystemMessage && this.props.enableEmojiPicker && !channelIsArchived) {
            postReaction = (
                <PostReaction
                    channelId={post.channel_id}
                    postId={post.id}
                    teamId={this.props.teamId}
                    getDotMenuRef={this.getDotMenuRef}
                    location={Locations.RHS_COMMENT}
                    showEmojiPicker={this.state.showEmojiPicker}
                    toggleEmojiPicker={this.toggleEmojiPicker}
                />
            );
        }

        let flagIcon: ReactNode = null;
        if (!isMobileView && (!isEphemeral && !post.failed && !isSystemMessage)) {
            flagIcon = (
                <PostFlagIcon
                    location={Locations.RHS_COMMENT}
                    postId={post.id}
                    isFlagged={this.props.isFlagged}
                />
            );
        }

        let options: ReactNode;
        if (isEphemeral) {
            options = (
                <div className='col col__remove'>
                    {this.createRemovePostButton()}
                </div>
            );
        } else if (isPostDeleted) {
            options = null;
        } else if (!isSystemMessage &&
            (isMobileView ||
            this.state.hover ||
            this.state.a11yActive ||
            this.state.showDotMenu ||
            this.state.showActionsMenu ||
            this.state.showActionTip ||
            this.state.showEmojiPicker)) {
            const showActionsMenuIcon = this.props.shouldShowActionsMenu && (isMobile || this.state.hover);
            const actionsMenu = showActionsMenuIcon && (
                <ActionsMenu
                    post={post}
                    location={Locations.RHS_COMMENT}
                    handleDropdownOpened={this.handleActionsMenuOpened}
                    isMenuOpen={this.state.showActionsMenu}
                    showPulsatingDot={this.props.showActionsMenuPulsatingDot}
                    showTutorialTip={this.state.showActionTip}
                    handleOpenTip={this.handleActionsMenuTipOpened}
                    handleNextTip={this.handleActionsMenuGotItClick}
                    handleDismissTip={this.handleTipDismissed}
                />
            );
            const dotMenu = (
                <DotMenu
                    post={this.props.post}
                    location={Locations.RHS_COMMENT}
                    isFlagged={this.props.isFlagged}
                    handleDropdownOpened={this.handleDotMenuOpened}
                    handleAddReactionClick={this.toggleEmojiPicker}
                    isReadOnly={isReadOnly || channelIsArchived}
                    isMenuOpen={this.state.showDotMenu}
                    enableEmojiPicker={this.props.enableEmojiPicker}
                />
            );

            options = (
                <div
                    ref={this.dotMenuRef}
                    data-testid={`post-menu-${this.props.post.id}`}
                    className='col post-menu'
                >
                    {!collapsedThreadsEnabled && !showRecentlyUsedReactions && dotMenu}
                    {showRecentReactions}
                    {postReaction}
                    {flagIcon}
                    {actionsMenu}
                    {(collapsedThreadsEnabled || showRecentlyUsedReactions) && dotMenu}
                </div>
            );
        }

        const postTime = this.renderPostTime();

        let postInfoIcon: ReactNode;
        if (post.props && post.props.card) {
            postInfoIcon = (
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
                            this.props.handleCardClick?.(this.props.post);
                        }}
                    >
                        <InfoSmallIcon
                            className='icon icon__info'
                            aria-hidden='true'
                        />
                    </button>
                </OverlayTrigger>
            );
        }

        let customStatus: ReactNode;
        if (!isSystemMessage) {
            customStatus = (
                <CustomStatusEmoji
                    userID={post.user_id}
                    showTooltip={true}
                    emojiStyle={{
                        marginLeft: 4,
                        marginTop: 2,
                    }}
                />
            );
        }

        const message = (
            <MessageWithAdditionalContent
                post={post}
                previewCollapsed={this.props.previewCollapsed}
                previewEnabled={this.props.previewEnabled}
                isEmbedVisible={this.props.isEmbedVisible}
                pluginPostTypes={this.props.pluginPostTypes}
            />
        );

        const showSlot = isPostBeingEdited ? AutoHeightSlots.SLOT2 : AutoHeightSlots.SLOT1;

        return (
            <PostAriaLabelDiv
                ref={this.postRef}
                role='listitem'
                id={'rhsPost_' + post.id}
                tabIndex={-1}
                post={post}
                className={this.getClassName(post, isSystemMessage, isMeMessage)}
                onClick={this.handlePostClick}
                onMouseOver={this.setHover}
                onMouseLeave={this.unsetHover}
                data-a11y-sort-order={this.props.a11yIndex}
            >
                <PostPreHeader
                    isFlagged={this.props.isFlagged}
                    isPinned={post.is_pinned}
                    channelId={post.channel_id}
                />
                <div
                    role='application'
                    className='post__content'
                >
                    <div className='post__img'>
                        {profilePicture}
                    </div>
                    <div>
                        <div
                            className='post__header'
                            ref={this.postHeaderRef}
                        >
                            <div className='col col__name'>
                                {userProfile}
                                {botIndicator}
                                {customStatus}
                            </div>
                            <div className='col'>
                                {postTime}
                                {postInfoIcon}
                                {visibleMessage}
                            </div>
                            {!isPostBeingEdited && options}
                        </div>
                        <div className={postClass} >
                            {failedPostOptions}
                            <AutoHeightSwitcher
                                showSlot={showSlot}
                                shouldScrollIntoView={isPostBeingEdited}
                                slot1={message}
                                slot2={<EditPost/>}
                                onTransitionEnd={() => document.dispatchEvent(new Event(AppEvents.FOCUS_EDIT_TEXTBOX))}
                            />
                            {fileAttachment}
                            <ReactionList
                                post={post}
                            />
                        </div>
                    </div>
                </div>
            </PostAriaLabelDiv>
        );
    }
}
