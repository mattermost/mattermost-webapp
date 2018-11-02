// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {Posts} from 'mattermost-redux/constants';
import * as ReduxPostUtils from 'mattermost-redux/utils/post_utils';
import Permissions from 'mattermost-redux/constants/permissions';

import {emitEmojiPosted} from 'actions/post_actions.jsx';
import Constants from 'utils/constants.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import CommentIcon from 'components/common/comment_icon.jsx';
import DotMenu from 'components/dot_menu';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostTime from 'components/post_view/post_time';
import EmojiIcon from 'components/svg/emoji_icon';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';

export default class PostInfo extends React.PureComponent {
    static propTypes = {

        /*
         * The post to render the info for
         */
        post: PropTypes.object.isRequired,

        /*
         * The id of the team which belongs the post
         */
        teamId: PropTypes.string,

        /*
         * Function called when the comment icon is clicked
         */
        handleCommentClick: PropTypes.func.isRequired,

        /*
         * Funciton called when the post options dropdown is opened
         */
        handleDropdownOpened: PropTypes.func.isRequired,

        /*
         * Set to mark the post as flagged
         */
        isFlagged: PropTypes.bool,

        /*
         * The number of replies in the same thread as this post
         */
        replyCount: PropTypes.number,

        /**
         * Set to indicate that this is previous post was not a reply to the same thread
         */
        isFirstReply: PropTypes.bool,

        /**
         * Set to render in mobile view
         */
        isMobile: PropTypes.bool,

        /*
         * Post identifiers for selenium tests
         */
        lastPostCount: PropTypes.number,

        /**
         * Set to render in compact view
         */
        compactDisplay: PropTypes.bool,

        /**
         * Function to get the post list HTML element
         */
        getPostList: PropTypes.func.isRequired,

        /**
         * Set to mark post as being hovered over
         */
        hover: PropTypes.bool.isRequired,

        /**
         * Set to render the post time when not hovering
         */
        showTimeWithoutHover: PropTypes.bool.isRequired,

        /**
         * Whether to show the emoji picker.
         */
        enableEmojiPicker: PropTypes.bool.isRequired,

        /**
         * Set not to allow edits on post
         */
        isReadOnly: PropTypes.bool,

        actions: PropTypes.shape({

            /*
             * Function to remove the post
             */
            removePost: PropTypes.func.isRequired,

            /*
             * Function to add a reaction to the post
             */
            addReaction: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            showEmojiPicker: false,
            reactionPickerOffset: 21,
        };
    }

    toggleEmojiPicker = () => {
        const showEmojiPicker = !this.state.showEmojiPicker;

        this.setState({showEmojiPicker});
        this.props.handleDropdownOpened(showEmojiPicker);
    };

    hideEmojiPicker = () => {
        this.setState({showEmojiPicker: false});
        this.props.handleDropdownOpened(false);
    };

    removePost = () => {
        this.props.actions.removePost(this.props.post);
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

    reactEmojiClick = (emoji) => {
        const pickerOffset = 21;
        this.setState({showEmojiPicker: false, reactionPickerOffset: pickerOffset});
        const emojiName = emoji.name || emoji.aliases[0];
        this.props.actions.addReaction(this.props.post.id, emojiName);
        emitEmojiPosted(emojiName);
        this.props.handleDropdownOpened(false);
    };

    handleDotMenuOpened = (open) => {
        this.setState({showDotMenu: open});
        this.props.handleDropdownOpened(open);
    };

    getDotMenu = () => {
        return this.refs.dotMenu;
    };

    buildOptions = (post, isSystemMessage, fromAutoResponder, idCount) => {
        if (!PostUtils.shouldShowDotMenu(post)) {
            return null;
        }

        const {isMobile, isReadOnly} = this.props;
        const hover = this.props.hover || this.state.showEmojiPicker || this.state.showDotMenu;

        let comments;
        let react;

        if (fromAutoResponder) {
            comments = (
                <CommentIcon
                    idPrefix='commentIcon'
                    idCount={idCount}
                    handleCommentClick={this.props.handleCommentClick}
                    commentCount={this.props.replyCount}
                    id={post.channel_id + '_' + post.id}
                />
            );
        }

        if (!isSystemMessage) {
            if (isMobile || hover || (!post.root_id && this.props.replyCount) || this.props.isFirstReply) {
                const extraClass = isMobile ? '' : 'pull-right';
                comments = (
                    <CommentIcon
                        idPrefix='commentIcon'
                        idCount={idCount}
                        handleCommentClick={this.props.handleCommentClick}
                        commentCount={this.props.replyCount}
                        id={post.channel_id + '_' + post.id}
                        extraClass={extraClass}
                    />
                );
            }

            if (hover && !isReadOnly && this.props.enableEmojiPicker) {
                const tooltip = (
                    <Tooltip
                        id='reaction-icon-tooltip'
                        className='hidden-xs'
                    >
                        <FormattedMessage
                            id='post_info.tooltip.add_reactions'
                            defaultMessage='Add Reaction'
                        />
                    </Tooltip>
                );

                react = (
                    <ChannelPermissionGate
                        channelId={post.channel_id}
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_REACTION]}
                    >
                        <div>
                            <EmojiPickerOverlay
                                show={this.state.showEmojiPicker}
                                container={this.props.getPostList}
                                target={this.getDotMenu}
                                onHide={this.hideEmojiPicker}
                                onEmojiClick={this.reactEmojiClick}
                                rightOffset={7}
                            />
                            <OverlayTrigger
                                className='hidden-xs'
                                delayShow={500}
                                placement='top'
                                overlay={tooltip}
                            >
                                <button
                                    className='reacticon__container color--link style--none'
                                    onClick={this.toggleEmojiPicker}
                                >
                                    <EmojiIcon className='icon icon--emoji'/>
                                </button>
                            </OverlayTrigger>
                        </div>
                    </ChannelPermissionGate>
                );
            }
        }

        let dotMenu;
        if (isMobile || hover) {
            dotMenu = (
                <DotMenu
                    post={post}
                    location={'CENTER'}
                    commentCount={this.props.replyCount}
                    isFlagged={this.props.isFlagged}
                    handleCommentClick={this.props.handleCommentClick}
                    handleDropdownOpened={this.handleDotMenuOpened}
                    isReadOnly={isReadOnly}
                />
            );
        }

        return (
            <div
                ref='dotMenu'
                className={'col col__reply'}
            >
                {dotMenu}
                {react}
                {comments}
            </div>
        );
    };

    render() {
        const post = this.props.post;

        let idCount = -1;
        if (this.props.lastPostCount >= 0 && this.props.lastPostCount < Constants.TEST_ID_COUNT) {
            idCount = this.props.lastPostCount;
        }

        const isEphemeral = Utils.isPostEphemeral(post);
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);

        let flagIcon;
        if (!isEphemeral && !post.failed && !isSystemMessage && (this.props.hover || this.props.isFlagged)) {
            flagIcon = (
                <PostFlagIcon
                    idPrefix='centerPostFlag'
                    idCount={idCount}
                    postId={post.id}
                    isFlagged={this.props.isFlagged}
                    isEphemeral={isEphemeral}
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
        } else if (!post.failed) {
            options = this.buildOptions(post, isSystemMessage, fromAutoResponder, idCount);
        }

        let visibleMessage;
        if (isEphemeral && !this.props.compactDisplay && post.state !== Posts.POST_DELETED) {
            visibleMessage = (
                <span className='post__visibility'>
                    <FormattedMessage
                        id='post_info.message.visible'
                        defaultMessage='(Only visible to you)'
                    />
                </span>
            );
        }

        let pinnedBadge;
        if (post.is_pinned) {
            pinnedBadge = (
                <span className='post__pinned-badge'>
                    <FormattedMessage
                        id='post_info.pinned'
                        defaultMessage='Pinned'
                    />
                </span>
            );
        }

        let postTime;
        if (this.props.hover || this.props.showTimeWithoutHover) {
            // timestamp should not be a permalink if the post has been deleted, is ephemeral message, or is pending
            const isPermalink = !(isEphemeral ||
                Posts.POST_DELETED === post.state ||
                ReduxPostUtils.isPostPendingOrFailed(post));

            postTime = (
                <PostTime
                    isPermalink={isPermalink}
                    eventTime={post.create_at}
                    postId={post.id}
                />
            );
        }

        return (
            <div className='post__header--info'>
                <div className='col'>
                    {postTime}
                    {pinnedBadge}
                    {flagIcon}
                    {visibleMessage}
                </div>
                {options}
            </div>
        );
    }
}
