// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Posts, Preferences} from 'mattermost-redux/constants/index';
import {
    isPostEphemeral,
    isPostPendingOrFailed,
    isMeMessage as checkIsMeMessage,
} from 'mattermost-redux/utils/post_utils';

import Constants, {Locations, A11yCustomEventTypes, AppEvents} from 'utils/constants';
import * as PostUtils from 'utils/post_utils';
import {isMobile} from 'utils/utils';
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
import {Emoji} from 'mattermost-redux/types/emojis';
import EditPost from 'components/edit_post';
import AutoHeightSwitcher, {AutoHeightSlots} from 'components/common/auto_height_switcher';

export default class RhsComment extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object,
        teamId: PropTypes.string.isRequired,
        currentUserId: PropTypes.string.isRequired,
        compactDisplay: PropTypes.bool,
        isFlagged: PropTypes.bool.isRequired,
        isBusy: PropTypes.bool,
        removePost: PropTypes.func.isRequired,
        previewCollapsed: PropTypes.string.isRequired,
        previewEnabled: PropTypes.bool.isRequired,
        isEmbedVisible: PropTypes.bool,
        enableEmojiPicker: PropTypes.bool.isRequired,
        enablePostUsernameOverride: PropTypes.bool.isRequired,
        isReadOnly: PropTypes.bool.isRequired,
        pluginPostTypes: PropTypes.object,
        channelIsArchived: PropTypes.bool.isRequired,
        isConsecutivePost: PropTypes.bool,
        handleCardClick: PropTypes.func,
        a11yIndex: PropTypes.number,

        /**
         * If the user that made the post is a bot.
         */
        isBot: PropTypes.bool.isRequired,

        /**
         * To Check if the current post is last in the list of RHS
         */
        isLastPost: PropTypes.bool,

        /**
         * To check if the state of emoji for last message and from where it was emitted
         */
        shortcutReactToLastPostEmittedFrom: PropTypes.string,
        actions: PropTypes.shape({
            markPostAsUnread: PropTypes.func.isRequired,

            /**
             * Function to set or unset emoji picker for last message
             */
            emitShortcutReactToLastPostFrom: PropTypes.func,

            /**
             * Function to set viewed Actions Menu for first time
             */
            setActionsMenuInitialisationState: PropTypes.func,
        }),
        timestampProps: PropTypes.object,
        collapsedThreadsEnabled: PropTypes.bool,

        shouldShowActionsMenu: PropTypes.bool,

        /**
        * true when want to show the Actions Menu with pulsating dot for tutorial
         */
        showActionsMenuPulsatingDot: PropTypes.bool,

        /**
         * To Check if the current post is to be highlighted and scrolled into center view of RHS
         */
        shouldHighlight: PropTypes.bool,

        oneClickReactionsEnabled: PropTypes.bool,
        recentEmojis: PropTypes.arrayOf(Emoji),

        isExpanded: PropTypes.bool,

        /**
         * check if the current post is being edited at the moment
         */
        isPostBeingEdited: PropTypes.bool,
        isMobileView: PropTypes.bool.isRequired,
    };

    constructor(props) {
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

    componentDidUpdate(prevProps) {
        const {shortcutReactToLastPostEmittedFrom, isLastPost} = this.props;

        if (this.state.a11yActive) {
            this.postRef.current.dispatchEvent(new Event(A11yCustomEventTypes.UPDATE));
        }

        const shortcutReactToLastPostEmittedFromRHS = prevProps.shortcutReactToLastPostEmittedFrom !== shortcutReactToLastPostEmittedFrom &&
        shortcutReactToLastPostEmittedFrom === Locations.RHS_ROOT;
        if (shortcutReactToLastPostEmittedFromRHS) {
            // Opening the emoji picker when more than one post in rhs is present
            this.handleShortcutReactToLastPost(isLastPost);
        }
    }

    handleShortcutReactToLastPost = (isLastPost) => {
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
            const isDeletedPost = post && post.state === Posts.POST_DELETED;
            const isEphemeralPost = post && isPostEphemeral(post);
            const isSystemMessage = post && PostUtils.isSystemMessage(post);
            const isAutoRespondersPost = post && PostUtils.fromAutoResponder(post);
            const isFailedPost = post && post.failed;

            // Checking if rhs comment is in scroll view of the user
            const boundingRectOfPostInfo = this.postHeaderRef.current.getBoundingClientRect();
            const isPostHeaderVisibleToUser = (boundingRectOfPostInfo.top - 110) > 0 &&
                boundingRectOfPostInfo.bottom < (window.innerHeight);

            if (isPostHeaderVisibleToUser && !isEphemeralPost && !isSystemMessage && !isReadOnly && !isFailedPost &&
                !isAutoRespondersPost && !isDeletedPost && !channelIsArchived && !isMobileView && enableEmojiPicker) {
                this.setState({hover: true}, () => {
                    this.toggleEmojiPicker();
                });
            }
        }
    }

    removePost = () => {
        this.props.removePost(this.props.post);
    };

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

    toggleEmojiPicker = () => {
        const showEmojiPicker = !this.state.showEmojiPicker;

        this.setState({
            showEmojiPicker,
        });
    };

    getClassName = (post, isSystemMessage, isMeMessage) => {
        let className = 'post post--thread same--root post--comment';

        if (this.props.shouldHighlight) {
            className += ' post--highlight';
        }

        if (this.props.isPostBeingEdited) {
            className += ' post--editing';
        }

        if (this.props.currentUserId === post.user_id) {
            className += ' current--user';
        }

        if (isSystemMessage || isMeMessage) {
            className += ' post--system';
        }

        if (this.props.compactDisplay) {
            className += ' post--compact';
        }

        if (this.state.showDotMenu ||
            this.state.showActionsMenu ||
            this.state.showActionTip ||
            this.state.fileDropdownOpened ||
            this.state.showEmojiPicker) {
            className += ' post--hovered';
        }

        if (this.props.isConsecutivePost) {
            className += ' same--user';
        }

        if (this.state.alt && !this.props.channelIsArchived) {
            className += ' cursor--pointer';
        }

        return className;
    };

    handleAlt = (e) => {
        if (this.state.alt !== e.altKey) {
            this.setState({alt: e.altKey});
        }
    }

    handleDotMenuOpened = (open) => {
        this.setState({showDotMenu: open});
    };

    handleFileDropdownOpened = (open) => {
        this.setState({fileDropdownOpened: open});
    };

    handleActionsMenuOpened = (open) => {
        if (this.props.showActionsMenuPulsatingDot) {
            this.setState({showActionTip: true});
            return;
        }
        this.setState({showActionsMenu: open});
    };

    handleActionsMenuTipOpened = () => {
        this.setState({showActionTip: true});
    };

    handleActionsMenuGotItClick = () => {
        this.props.actions.setActionsMenuInitialisationState?.(({[Preferences.ACTIONS_MENU_VIEWED]: true}));
        this.setState({showActionTip: false});
    };

    handleTipDismissed = () => {
        this.setState({showActionTip: false});
    };

    getDotMenuRef = () => {
        return this.dotMenuRef.current;
    };

    setHover = (e) => {
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

    handleA11yActivateEvent = () => {
        this.setState({a11yActive: true});
    }

    handleA11yDeactivateEvent = () => {
        this.setState({a11yActive: false});
    }

    handlePostClick = (e) => {
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

        let botIndicator;
        let profilePicture;
        let visibleMessage;

        let userProfile = null;
        if (this.props.compactDisplay || isMobileView) {
            userProfile = (
                <UserProfile
                    userId={post.user_id}
                    channelId={post.channel_id}
                    isBusy={this.props.isBusy}
                    isRHS={true}
                    hasMention={true}
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
                />
            );

            profilePicture = (
                <PostProfilePicture
                    compactDisplay={this.props.compactDisplay}
                    isBusy={this.props.isBusy}
                    isRHS={true}
                    post={post}
                    userId={post.user_id}
                    channelId={post.channel_id}
                />
            );

            if (post.props && post.props.from_webhook) {
                if (post.props.override_username && this.props.enablePostUsernameOverride) {
                    userProfile = (
                        <UserProfile
                            userId={post.user_id}
                            channelId={post.channel_id}
                            hideStatus={true}
                            overwriteName={post.props.override_username}
                            disablePopover={true}
                        />
                    );
                } else {
                    userProfile = (
                        <UserProfile
                            userId={post.user_id}
                            channelId={post.channel_id}
                            hideStatus={true}
                            disablePopover={true}
                        />
                    );
                }

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

        let failedPostOptions;

        if (post.failed) {
            failedPostOptions = <FailedPostOptions post={this.props.post}/>;
        }

        const postClass = PostUtils.isEdited(this.props.post) ? ' post--edited' : '';

        let fileAttachment = null;
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
        let showRecentReacions;
        if (showRecentlyUsedReactions) {
            showRecentReacions = (
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

        let postReaction;
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

        let flagIcon = null;
        if (!isMobileView && (!isEphemeral && !post.failed && !isSystemMessage)) {
            flagIcon = (
                <PostFlagIcon
                    location={Locations.RHS_COMMENT}
                    postId={post.id}
                    isFlagged={this.props.isFlagged}
                />
            );
        }

        let options;
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
                    {showRecentReacions}
                    {postReaction}
                    {flagIcon}
                    {actionsMenu}
                    {(collapsedThreadsEnabled || showRecentlyUsedReactions) && dotMenu}
                </div>
            );
        }

        const postTime = this.renderPostTime();

        let postInfoIcon;
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
                            this.props.handleCardClick(this.props.post);
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

        let customStatus;
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
                tabIndex='-1'
                post={post}
                className={`a11y__section ${this.getClassName(post, isSystemMessage, isMeMessage)}`}
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
                        <div className={`post__body${postClass}`} >
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
                                isReadOnly={isReadOnly || channelIsArchived}
                            />
                        </div>
                    </div>
                </div>
            </PostAriaLabelDiv>
        );
    }
}
