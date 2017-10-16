// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';
import * as ReduxPostUtils from 'mattermost-redux/utils/post_utils';

import {emitEmojiPosted} from 'actions/post_actions.jsx';

import Constants from 'utils/constants.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';

import CommentIcon from 'components/common/comment_icon.jsx';
import DotMenu from 'components/dot_menu';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import PostFlagIcon from 'components/post_view/post_flag_icon.jsx';
import PostTime from 'components/post_view/post_time.jsx';

export default class PostInfo extends React.PureComponent {
    static propTypes = {

        /*
         * The post to render the info for
         */
        post: PropTypes.object.isRequired,

        /*
         * Function called when the comment icon is clicked
         */
        handleCommentClick: PropTypes.func.isRequired,

        /*
         * Funciton called when the post options dropdown is opened
         */
        handleDropdownOpened: PropTypes.func.isRequired,

        /*
         * Set to display in 24 hour format
         */
        useMilitaryTime: PropTypes.bool.isRequired,

        /*
         * Set to mark the post as flagged
         */
        isFlagged: PropTypes.bool,

        /*
         * The number of replies in the same thread as this post
         */
        replyCount: PropTypes.number,

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

        actions: PropTypes.shape({

            /*
             * Function to remove the post
             */
            removePost: PropTypes.func.isRequired,

            /*
             * Function to add a reaction to the post
             */
            addReaction: PropTypes.func.isRequired
        }).isRequired
    };

    constructor(props) {
        super(props);

        this.removePost = this.removePost.bind(this);
        this.reactEmojiClick = this.reactEmojiClick.bind(this);

        this.state = {
            showEmojiPicker: false,
            reactionPickerOffset: 21
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

    removePost() {
        this.props.actions.removePost(this.props.post);
    }

    createRemovePostButton() {
        return (
            <button
                className='post__remove theme color--link style--none'
                type='button'
                onClick={this.removePost}
            >
                {'×'}
            </button>
        );
    }

    reactEmojiClick(emoji) {
        const pickerOffset = 21;
        this.setState({showEmojiPicker: false, reactionPickerOffset: pickerOffset});
        const emojiName = emoji.name || emoji.aliases[0];
        this.props.actions.addReaction(this.props.post.id, emojiName);
        emitEmojiPosted(emojiName);
        this.props.handleDropdownOpened(false);
    }

    getDotMenu = () => {
        return this.refs.dotMenu;
    };

    render() {
        const post = this.props.post;

        let idCount = -1;
        if (this.props.lastPostCount >= 0 && this.props.lastPostCount < Constants.TEST_ID_COUNT) {
            idCount = this.props.lastPostCount;
        }

        const isEphemeral = Utils.isPostEphemeral(post);
        const isSystemMessage = PostUtils.isSystemMessage(post);

        let comments = null;
        let react = null;
        let flagIcon = null;
        if (!isEphemeral && !post.failed && !isSystemMessage) {
            comments = (
                <CommentIcon
                    idPrefix='commentIcon'
                    idCount={idCount}
                    handleCommentClick={this.props.handleCommentClick}
                    commentCount={this.props.replyCount}
                    id={post.channel_id + '_' + post.id}
                />
            );

            if (window.mm_config.EnableEmojiPicker === 'true') {
                react = (
                    <span>
                        <EmojiPickerOverlay
                            show={this.state.showEmojiPicker}
                            container={this.props.getPostList}
                            target={this.getDotMenu}
                            onHide={this.hideEmojiPicker}
                            onEmojiClick={this.reactEmojiClick}
                            rightOffset={7}
                        />
                        <button
                            className='reacticon__container color--link style--none'
                            onClick={this.toggleEmojiPicker}
                        >
                            <span
                                className='icon icon--emoji'
                                dangerouslySetInnerHTML={{__html: Constants.EMOJI_ICON_SVG}}
                            />
                        </button>
                    </span>

                );
            }

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
            const dotMenu = (
                <DotMenu
                    idPrefix={Constants.CENTER}
                    idCount={idCount}
                    post={this.props.post}
                    commentCount={this.props.replyCount}
                    isFlagged={this.props.isFlagged}
                    handleCommentClick={this.props.handleCommentClick}
                    handleDropdownOpened={this.props.handleDropdownOpened}
                />
            );

            if (PostUtils.shouldShowDotMenu(this.props.post)) {
                options = (
                    <div
                        ref='dotMenu'
                        className='col col__reply'
                    >
                        {dotMenu}
                        {react}
                        {comments}
                    </div>
                );
            }
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

        // timestamp should not be a permalink if the post has been deleted, is ephemeral message, or is pending
        const isPermalink = !(isEphemeral ||
            Posts.POST_DELETED === this.props.post.state ||
            ReduxPostUtils.isPostPendingOrFailed(this.props.post));

        return (
            <div className='post__header--info'>
                <div className='col'>
                    <PostTime
                        isPermalink={isPermalink}
                        eventTime={post.create_at}
                        useMilitaryTime={this.props.useMilitaryTime}
                        postId={post.id}
                    />
                    {pinnedBadge}
                    {this.state.showEmojiPicker}
                    {flagIcon}
                    {visibleMessage}
                </div>
                {options}
            </div>
        );
    }
}
