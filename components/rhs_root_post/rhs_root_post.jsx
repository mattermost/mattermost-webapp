// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import {Tooltip} from 'react-bootstrap';
import {Posts} from 'mattermost-redux/constants';
import * as ReduxPostUtils from 'mattermost-redux/utils/post_utils';

import Constants, {Locations} from 'utils/constants';
import * as PostUtils from 'utils/post_utils.jsx';
import {intlShape} from 'utils/react_intl';
import * as Utils from 'utils/utils.jsx';
import DotMenu from 'components/dot_menu';
import FileAttachmentListContainer from 'components/file_attachment_list';
import OverlayTrigger from 'components/overlay_trigger';
import PostProfilePicture from 'components/post_profile_picture';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import ReactionList from 'components/post_view/reaction_list';
import PostTime from 'components/post_view/post_time';
import PostReaction from 'components/post_view/post_reaction';
import MessageWithAdditionalContent from 'components/message_with_additional_content';
import BotBadge from 'components/widgets/badges/bot_badge';
import InfoSmallIcon from 'components/widgets/icons/info_small_icon';

import UserProfile from 'components/user_profile';
import PostPreHeader from 'components/post_view/post_pre_header';

class RhsRootPost extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object.isRequired,
        teamId: PropTypes.string.isRequired,
        currentUserId: PropTypes.string.isRequired,
        compactDisplay: PropTypes.bool,
        commentCount: PropTypes.number.isRequired,
        author: PropTypes.string,
        reactions: PropTypes.object,
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
        handleCardClick: PropTypes.func.isRequired,

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

    static defaultProps = {
        commentCount: 0,
    };

    constructor(props) {
        super(props);

        this.state = {
            alt: false,
            showEmojiPicker: false,
            testStateObj: true,
            dropdownOpened: false,
            currentAriaLabel: '',
        };

        this.postHeaderRef = React.createRef();
    }

    handleShortcutReactToLastPost = (isLastPost) => {
        if (isLastPost) {
            const {post, enableEmojiPicker, channelIsArchived,
                actions: {emitShortcutReactToLastPostFrom}} = this.props;

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
                if (!isEphemeralPost && !isSystemMessage && !isDeletedPost && !isFailedPost && !Utils.isMobile() &&
                    !channelIsArchived && !isPostsFakeParentDeleted && enableEmojiPicker) {
                    // As per issue in #2 of mattermost-webapp/pull/4478#pullrequestreview-339313236
                    // We are not not handling focus condition as we did for rhs_comment as the dot menu is already in dom and not visible
                    this.toggleEmojiPicker(isLastPost);
                }
            }
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleAlt);
        document.addEventListener('keyup', this.handleAlt);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleAlt);
        document.removeEventListener('keyup', this.handleAlt);
    }

    componentDidUpdate(prevProps) {
        const {shortcutReactToLastPostEmittedFrom, isLastPost} = this.props;

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
        let className = 'post post--root post--thread';
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

    handlePostClick = (e) => {
        if (this.props.channelIsArchived) {
            return;
        }

        if (e.altKey) {
            this.props.actions.markPostAsUnread(this.props.post);
        }
    }

    handlePostFocus = () => {
        const {post, author, reactions, isFlagged, emojiMap} = this.props;
        this.setState({currentAriaLabel: PostUtils.createAriaLabelForPost(post, author, isFlagged, reactions, this.props.intl, emojiMap)});
    }

    getDotMenuRef = () => {
        return this.refs.dotMenu;
    };

    render() {
        const {post, isReadOnly, teamId, channelIsArchived} = this.props;

        const isPostDeleted = post && post.state === Posts.POST_DELETED;
        const isEphemeral = Utils.isPostEphemeral(post);
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const isMeMessage = ReduxPostUtils.isMeMessage(post);

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
                    />
                );
            } else {
                userProfile = (
                    <UserProfile
                        key={post.user_id}
                        userId={post.user_id}
                        hideStatus={true}
                        disablePopover={true}
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
                />
            );
        }

        let postClass = '';
        if (PostUtils.isEdited(this.props.post)) {
            postClass += ' post--edited';
        }

        const dotMenu = (
            <DotMenu
                post={this.props.post}
                location={Locations.RHS_ROOT}
                isFlagged={this.props.isFlagged}
                handleDropdownOpened={this.handleDropdownOpened}
                handleAddReactionClick={this.toggleEmojiPicker}
                commentCount={this.props.commentCount}
                isMenuOpen={this.state.dropdownOpened}
                isReadOnly={isReadOnly || channelIsArchived}
                enableEmojiPicker={this.props.enableEmojiPicker}
            />
        );

        let postFlagIcon;
        const showFlagIcon = !isEphemeral && !post.failed && !isSystemMessage && !Utils.isMobile();
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
                    ref='dotMenu'
                    className='col post-menu'
                >
                    {dotMenu}
                    {postReaction}
                    {postFlagIcon}
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

        return (
            <div
                role='listitem'
                id={'rhsPost_' + post.id}
                tabIndex='-1'
                className={`thread__root a11y__section ${this.getClassName(post, isSystemMessage, isMeMessage)}`}
                aria-label={this.state.currentAriaLabel}
                onClick={this.handlePostClick}
                onFocus={this.handlePostFocus}
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
                            </div>
                            <div className='col'>
                                {this.renderPostTime(isEphemeral)}
                                {postInfoIcon}
                            </div>
                            {dotMenuContainer}
                        </div>
                        <div className='post__body'>
                            <div className={postClass}>
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

export default injectIntl(RhsRootPost);
/* eslint-enable react/no-string-refs */
