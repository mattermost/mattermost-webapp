// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import {Tooltip} from 'react-bootstrap';
import {Posts} from 'mattermost-redux/constants/index';
import {
    isPostEphemeral,
    isPostPendingOrFailed,
    isMeMessage as checkIsMeMessage,
} from 'mattermost-redux/utils/post_utils';

import Constants, {Locations, A11yCustomEventTypes} from 'utils/constants';
import * as PostUtils from 'utils/post_utils.jsx';
import {intlShape} from 'utils/react_intl';
import {isMobile} from 'utils/utils.jsx';
import DotMenu from 'components/dot_menu';
import FileAttachmentListContainer from 'components/file_attachment_list';
import OverlayTrigger from 'components/overlay_trigger';
import PostProfilePicture from 'components/post_profile_picture';
import FailedPostOptions from 'components/post_view/failed_post_options';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostTime from 'components/post_view/post_time';
import PostReaction from 'components/post_view/post_reaction';
import ReactionList from 'components/post_view/reaction_list';
import MessageWithAdditionalContent from 'components/message_with_additional_content';
import BotBadge from 'components/widgets/badges/bot_badge';
import Badge from 'components/widgets/badges/badge';
import InfoSmallIcon from 'components/widgets/icons/info_small_icon';
import PostPreHeader from 'components/post_view/post_pre_header';
import UserProfile from 'components/user_profile';

class RhsComment extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object,
        teamId: PropTypes.string.isRequired,
        currentUserId: PropTypes.string.isRequired,
        compactDisplay: PropTypes.bool,
        author: PropTypes.string,
        reactions: PropTypes.object,
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
        intl: intlShape.isRequired,
        actions: PropTypes.shape({
            markPostAsUnread: PropTypes.func.isRequired,

            /**
             * Function to set or unset emoji picker for last message
             */
            emitShortcutReactToLastPostFrom: PropTypes.func,
        }),
        emojiMap: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.postRef = React.createRef();
        this.dotMenuRef = React.createRef();

        this.state = {
            showEmojiPicker: false,
            dropdownOpened: false,
            alt: false,
            hover: false,
            a11yActive: false,
            currentAriaLabel: '',
        };

        this.postHeaderRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleAlt);
        document.addEventListener('keyup', this.handleAlt);

        if (this.postRef.current) {
            this.postRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.postRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleAlt);
        document.removeEventListener('keyup', this.handleAlt);

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
            const {isReadOnly, channelIsArchived, enableEmojiPicker, post,
                actions: {emitShortcutReactToLastPostFrom}} = this.props;

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
                !isAutoRespondersPost && !isDeletedPost && !channelIsArchived && !isMobile() && enableEmojiPicker) {
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

        if (this.props.currentUserId === post.user_id) {
            className += ' current--user';
        }

        if (isSystemMessage || isMeMessage) {
            className += ' post--system';
        }

        if (this.props.compactDisplay) {
            className += ' post--compact';
        }

        if (this.state.dropdownOpened || this.state.showEmojiPicker) {
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

    handleDropdownOpened = (isOpened) => {
        this.setState({
            dropdownOpened: isOpened,
        });
    };

    getDotMenuRef = () => {
        return this.dotMenuRef.current;
    };

    setHover = () => {
        this.setState({hover: true});
    }

    unsetHover = () => {
        this.setState({hover: false});
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
            this.props.actions.markPostAsUnread(this.props.post);
        }
    }

    handlePostFocus = () => {
        const {post, author, reactions, isFlagged, intl, emojiMap} = this.props;
        this.setState({currentAriaLabel: PostUtils.createAriaLabelForPost(post, author, isFlagged, reactions, intl, emojiMap)});
    }

    render() {
        const {post, isConsecutivePost, isReadOnly, channelIsArchived} = this.props;

        const isPostDeleted = post && post.state === Posts.POST_DELETED;
        const isEphemeral = isPostEphemeral(post);
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const isMeMessage = checkIsMeMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);

        let botIndicator;
        let profilePicture;
        let visibleMessage;

        let userProfile = null;
        if (this.props.compactDisplay || isMobile()) {
            userProfile = (
                <UserProfile
                    userId={post.user_id}
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
                />
            );

            if (post.props && post.props.from_webhook) {
                if (post.props.override_username && this.props.enablePostUsernameOverride) {
                    userProfile = (
                        <UserProfile
                            userId={post.user_id}
                            hideStatus={true}
                            overwriteName={post.props.override_username}
                            disablePopover={true}
                        />
                    );
                } else {
                    userProfile = (
                        <UserProfile
                            userId={post.user_id}
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
        let postClass = '';

        if (post.failed) {
            postClass += ' post-failed';
            failedPostOptions = <FailedPostOptions post={this.props.post}/>;
        }

        if (PostUtils.isEdited(this.props.post)) {
            postClass += ' post--edited';
        }

        let fileAttachment = null;
        if (post.file_ids && post.file_ids.length > 0) {
            fileAttachment = (
                <FileAttachmentListContainer
                    post={post}
                    compactDisplay={this.props.compactDisplay}
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
        if (!isMobile() && (!isEphemeral && !post.failed && !isSystemMessage)) {
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
        } else if (!isSystemMessage && (isMobile() || this.state.hover || this.state.a11yActive || this.state.dropdownOpened || this.state.showEmojiPicker)) {
            const dotMenu = (
                <DotMenu
                    post={this.props.post}
                    location={Locations.RHS_COMMENT}
                    isFlagged={this.props.isFlagged}
                    handleDropdownOpened={this.handleDropdownOpened}
                    handleAddReactionClick={this.toggleEmojiPicker}
                    isReadOnly={isReadOnly || channelIsArchived}
                    isMenuOpen={this.state.dropdownOpened}
                    enableEmojiPicker={this.props.enableEmojiPicker}
                />
            );

            options = (
                <div
                    ref={this.dotMenuRef}
                    className='col post-menu'
                >
                    {dotMenu}
                    {postReaction}
                    {flagIcon}
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

        return (
            <div
                role='listitem'
                ref={this.postRef}
                id={'rhsPost_' + post.id}
                tabIndex='-1'
                className={`a11y__section ${this.getClassName(post, isSystemMessage, isMeMessage)}`}
                onClick={this.handlePostClick}
                onMouseOver={this.setHover}
                onMouseLeave={this.unsetHover}
                aria-label={this.state.currentAriaLabel}
                onFocus={this.handlePostFocus}
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
                            </div>
                            <div className='col'>
                                {postTime}
                                {postInfoIcon}
                                {visibleMessage}
                            </div>
                            {options}
                        </div>
                        <div className='post__body' >
                            <div className={postClass}>
                                {failedPostOptions}
                                <MessageWithAdditionalContent
                                    post={post}
                                    previewCollapsed={this.props.previewCollapsed}
                                    previewEnabled={this.props.previewEnabled}
                                    isEmbedVisible={this.props.isEmbedVisible}
                                    pluginPostTypes={this.props.pluginPostTypes}
                                />
                            </div>
                            {fileAttachment}
                            <ReactionList
                                post={post}
                                isReadOnly={isReadOnly || channelIsArchived}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(RhsComment);
/* eslint-enable react/no-string-refs */
