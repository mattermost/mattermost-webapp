// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {createRef} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {Posts, Preferences} from 'mattermost-redux/constants';
import * as ReduxPostUtils from 'mattermost-redux/utils/post_utils';

import Constants, {Locations, A11yCustomEventTypes, AppEvents} from 'utils/constants';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils';
import ActionsMenu from 'components/actions_menu';
import DotMenu from 'components/dot_menu';
import FileAttachmentListContainer from 'components/file_attachment_list';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import PostProfilePicture from 'components/post_profile_picture';
import PostAriaLabelDiv from 'components/post_view/post_aria_label_div';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import ReactionList from 'components/post_view/reaction_list';
import PostTime from 'components/post_view/post_time';
import PostRecentReactions from 'components/post_view/post_recent_reactions';
import PostReaction from 'components/post_view/post_reaction';
import MessageWithAdditionalContent from 'components/message_with_additional_content';
import BotBadge from 'components/widgets/badges/bot_badge';
import InfoSmallIcon from 'components/widgets/icons/info_small_icon';
import PriorityLabel from 'components/post_priority/post_priority_label';

import UserProfile from 'components/user_profile';
import PostPreHeader from 'components/post_view/post_pre_header';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import EditPost from 'components/edit_post';
import AutoHeightSwitcher, {AutoHeightSlots} from 'components/common/auto_height_switcher';

export default class RhsRootPost extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object.isRequired,
        teamId: PropTypes.string.isRequired,
        currentUserId: PropTypes.string.isRequired,
        compactDisplay: PropTypes.bool,
        colorizeUsernames: PropTypes.bool,
        commentCount: PropTypes.number.isRequired,
        isFlagged: PropTypes.bool.isRequired,
        previewCollapsed: PropTypes.string,
        previewEnabled: PropTypes.bool,
        isBusy: PropTypes.bool,
        isEmbedVisible: PropTypes.bool,
        enableEmojiPicker: PropTypes.bool.isRequired,
        enablePostUsernameOverride: PropTypes.bool.isRequired,
        isReadOnly: PropTypes.bool.isRequired,
        pluginPostTypes: PropTypes.object,
        channelIsArchived: PropTypes.bool.isRequired,
        isPostPriorityEnabled: PropTypes.bool.isRequired,
        handleCardClick: PropTypes.func.isRequired,

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
        isBot: PropTypes.bool,
        collapsedThreadsEnabled: PropTypes.bool,
        shouldShowActionsMenu: PropTypes.bool,

        /**
        * true when want to show the Actions Menu with pulsating dot for tutorial
         */
        showActionsMenuPulsatingDot: PropTypes.bool,
        oneClickReactionsEnabled: PropTypes.bool,

        // e.g. import {Emoji} from '@mattermost/types/emojis';
        recentEmojis: PropTypes.arrayOf(PropTypes.object),

        isExpanded: PropTypes.bool,

        /**
         * check if the current post is being edited at the moment
         */
        isPostBeingEdited: PropTypes.bool,
        isMobileView: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        commentCount: 0,
    };

    constructor(props) {
        super(props);

        this.state = {
            alt: false,
            showActionsMenu: false,
            showActionTip: false,
            showDotMenu: false,
            showEmojiPicker: false,
            testStateObj: true,
            fileDropdownOpened: false,
            hover: false,
            a11yActive: false,
        };

        this.postHeaderRef = createRef();
        this.dotMenuRef = createRef();
        this.postRef = createRef();
    }

    handleShortcutReactToLastPost = (isLastPost) => {
        if (isLastPost) {
            const {
                channelIsArchived,
                enableEmojiPicker,
                isMobileView,
                post,
                actions: {
                    emitShortcutReactToLastPostFrom,
                },
            } = this.props;

            // Setting the last message emoji action to empty to clean up the redux state
            emitShortcutReactToLastPostFrom(Locations.NO_WHERE);

            // Following are the types of posts on which adding reaction is not possible
            const isDeletedPost = post && post.state === Posts.POST_DELETED;
            const isEphemeralPost = post && Utils.isPostEphemeral(post);
            const isSystemMessage = post && PostUtils.isSystemMessage(post);
            const isFailedPost = post && post.failed;
            const isPostsFakeParentDeleted = post && post.type === Constants.PostTypes.FAKE_PARENT_DELETED;

            // Checking if rhs root comment is at scroll view of the user
            const boundingRectOfPostInfo = this.postHeaderRef.current.getBoundingClientRect();
            const isPostHeaderVisibleToUser = (boundingRectOfPostInfo.top - 110) > 0 &&
                boundingRectOfPostInfo.bottom < (window.innerHeight);

            if (isPostHeaderVisibleToUser) {
                if (!isEphemeralPost && !isSystemMessage && !isDeletedPost && !isFailedPost && !isMobileView &&
                    !channelIsArchived && !isPostsFakeParentDeleted && enableEmojiPicker) {
                    // As per issue in #2 of mattermost-webapp/pull/4478#pullrequestreview-339313236
                    // We are not not handling focus condition as we did for rhs_comment as the dot menu is already in dom and not visible
                    this.toggleEmojiPicker(isLastPost);
                }
            }
        }
    }

    componentDidMount() {
        if (this.postRef.current) {
            this.postRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.postRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }
    }
    componentWillUnmount() {
        if (this.state.show) {
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
            this.handleShortcutReactToLastPost(isLastPost);
        }
    }

    renderPostTime = (isEphemeral) => {
        const post = this.props.post;

        if (post.type === Constants.PostTypes.FAKE_PARENT_DELETED) {
            return null;
        }

        const isPermalink = !(isEphemeral ||
            Posts.POST_DELETED === post.state ||
            ReduxPostUtils.isPostPendingOrFailed(post));

        return (
            <PostTime
                isPermalink={isPermalink}
                eventTime={post.create_at}
                postId={post.id}
                location={Locations.RHS_ROOT}
                timestampProps={this.props.timestampProps}
            />
        );
    };

    toggleEmojiPicker = (e) => {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }

        const showEmojiPicker = !this.state.showEmojiPicker;
        this.setState({showEmojiPicker});
    };

    handleA11yActivateEvent = () => {
        this.setState({a11yActive: true});
    }

    handleA11yDeactivateEvent = () => {
        this.setState({a11yActive: false});
    }

    getClassName = (post, isSystemMessage, isMeMessage) => {
        let className = 'post post--root post--thread';
        if (this.props.currentUserId === post.user_id) {
            className += ' current--user';
        }

        if (this.props.isPostBeingEdited) {
            className += ' post--editing';
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

        if (this.state.alt && !this.props.channelIsArchived) {
            className += ' cursor--pointer';
        }

        return className;
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

    handleAlt = (e) => {
        if (this.state.alt !== e.altKey) {
            this.setState({alt: e.altKey});
        }
    }

    handleActionsMenuOpened = (open) => {
        if (this.props.showActionsMenuPulsatingDot) {
            this.setState({showActionTip: true});
            return;
        }
        this.setState({showActionsMenu: open});
    };

    handleDotMenuOpened = (open) => {
        this.setState({showDotMenu: open});
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

    handleFileDropdownOpened = (open) => {
        this.setState({fileDropdownOpened: open});
    };

    handlePostClick = (e) => {
        if (this.props.channelIsArchived) {
            return;
        }

        if (e.altKey) {
            this.props.actions.markPostAsUnread(this.props.post, 'RHS_ROOT');
        }
    }

    getDotMenuRef = () => {
        return this.dotMenuRef.current;
    };

    render() {
        const {
            channelIsArchived,
            collapsedThreadsEnabled,
            isBot,
            isMobileView,
            isReadOnly,
            post,
            teamId,
            isPostBeingEdited,
        } = this.props;

        const isPostDeleted = post && post.state === Posts.POST_DELETED;
        const isEphemeral = Utils.isPostEphemeral(post);
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const isMeMessage = ReduxPostUtils.isMeMessage(post);
        const colorize = this.props.compactDisplay && this.props.colorizeUsernames;

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
                    teamId={teamId}
                    getDotMenuRef={this.getDotMenuRef}
                    location={Locations.RHS_ROOT}
                    showEmojiPicker={this.state.showEmojiPicker}
                    toggleEmojiPicker={this.toggleEmojiPicker}
                />
            );
        }

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

        let userProfile;
        let botIndicator;
        if (isSystemMessage) {
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
                    colorize={colorize}
                />
            );
        } else if (post.props && post.props.from_webhook) {
            if (post.props.override_username && this.props.enablePostUsernameOverride) {
                userProfile = (
                    <UserProfile
                        key={post.user_id}
                        userId={post.user_id}
                        hideStatus={true}
                        overwriteName={post.props.override_username}
                        disablePopover={true}
                        colorize={colorize}
                    />
                );
            } else {
                userProfile = (
                    <UserProfile
                        key={post.user_id}
                        userId={post.user_id}
                        hideStatus={true}
                        disablePopover={true}
                        colorize={colorize}
                    />
                );
            }

            botIndicator = <BotBadge/>;
        } else {
            userProfile = (
                <UserProfile
                    key={post.user_id}
                    userId={post.user_id}
                    isBusy={this.props.isBusy}
                    isRHS={true}
                    hasMention={true}
                    colorize={colorize}
                />
            );
        }

        const postClass = classNames('post__body--transition', {'post--edited': PostUtils.isEdited(this.props.post)});

        const actionsMenu = (
            <ActionsMenu
                post={this.props.post}
                location={Locations.RHS_ROOT}
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
                location={Locations.RHS_ROOT}
                isFlagged={this.props.isFlagged}
                handleDropdownOpened={this.handleDotMenuOpened}
                handleAddReactionClick={this.toggleEmojiPicker}
                commentCount={this.props.commentCount}
                isMenuOpen={this.state.showDotMenu}
                isReadOnly={isReadOnly || channelIsArchived}
                enableEmojiPicker={this.props.enableEmojiPicker}
            />
        );

        let postFlagIcon;
        const showFlagIcon = !isEphemeral && !post.failed && !isSystemMessage && !isMobileView;
        if (showFlagIcon) {
            postFlagIcon = (
                <PostFlagIcon
                    location={Locations.RHS_ROOT}
                    postId={post.id}
                    isFlagged={this.props.isFlagged}
                />
            );
        }

        let dotMenuContainer;
        if (!isPostDeleted && this.props.post.type !== Constants.PostTypes.FAKE_PARENT_DELETED) {
            dotMenuContainer = (
                <div
                    ref={this.dotMenuRef}
                    className='col post-menu'
                >
                    {!collapsedThreadsEnabled && !showRecentlyUsedReactions && dotMenu}
                    {showRecentReacions}
                    {postReaction}
                    {postFlagIcon}
                    {actionsMenu}
                    {(collapsedThreadsEnabled || showRecentlyUsedReactions) && dotMenu}
                </div>
            );
        }

        let postInfoIcon;
        if (this.props.post.props && this.props.post.props.card) {
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
        if (!(isSystemMessage || post?.props?.from_webhook || isBot)) {
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

        let priority;
        if (post.props?.priority && this.props.isPostPriorityEnabled) {
            priority = <span className='d-flex mr-2 ml-1'><PriorityLabel priority={post.props.priority}/></span>;
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
                className={`thread__root a11y__section ${this.getClassName(post, isSystemMessage, isMeMessage)}`}
                onClick={this.handlePostClick}
                onMouseOver={this.setHover}
                onMouseLeave={this.unsetHover}
                data-a11y-sort-order='0'
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
                        <PostProfilePicture
                            compactDisplay={this.props.compactDisplay}
                            isBusy={this.props.isBusy}
                            isRHS={true}
                            post={post}
                            userId={post.user_id}
                            channelId={post.channel_id}
                        />
                    </div>
                    <div>
                        <div
                            className='post__header'
                            ref={this.postHeaderRef}
                        >
                            <div className='col__name'>
                                {userProfile}
                                {botIndicator}
                                {customStatus}
                            </div>
                            <div className='col d-flex align-items-center'>
                                {this.renderPostTime(isEphemeral)}
                                {priority}
                                {postInfoIcon}
                            </div>
                            {!isPostBeingEdited && dotMenuContainer}
                        </div>
                        <div className='post__body'>
                            <div className={postClass}>
                                <AutoHeightSwitcher
                                    showSlot={showSlot}
                                    shouldScrollIntoView={isPostBeingEdited}
                                    slot1={message}
                                    slot2={<EditPost/>}
                                    onTransitionEnd={() => document.dispatchEvent(new Event(AppEvents.FOCUS_EDIT_TEXTBOX))}
                                />
                            </div>
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
