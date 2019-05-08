// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Posts} from 'mattermost-redux/constants/index';
import {
    isPostEphemeral,
    isPostPendingOrFailed,
} from 'mattermost-redux/utils/post_utils';

import Constants, {Locations} from 'utils/constants.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import DotMenu from 'components/dot_menu';
import FileAttachmentListContainer from 'components/file_attachment_list';
import PostProfilePicture from 'components/post_profile_picture';
import FailedPostOptions from 'components/post_view/failed_post_options';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostTime from 'components/post_view/post_time';
import PostReaction from 'components/post_view/post_reaction';
import ReactionList from 'components/post_view/reaction_list';
import MessageWithAdditionalContent from 'components/message_with_additional_content';
import BotBadge from 'components/widgets/badges/bot_badge.jsx';
import Badge from 'components/widgets/badges/badge.jsx';

import UserProfile from 'components/user_profile';

export default class RhsComment extends React.Component {
    static propTypes = {
        post: PropTypes.object,
        teamId: PropTypes.string.isRequired,
        currentUserId: PropTypes.string.isRequired,
        compactDisplay: PropTypes.bool,
        isFlagged: PropTypes.bool,
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
    };

    constructor(props) {
        super(props);

        this.state = {
            showEmojiPicker: false,
            dropdownOpened: false,
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.isBusy !== this.props.isBusy) {
            return true;
        }

        if (nextProps.compactDisplay !== this.props.compactDisplay) {
            return true;
        }

        if (nextProps.isFlagged !== this.props.isFlagged) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextProps.post, this.props.post)) {
            return true;
        }

        if (this.state.showEmojiPicker !== nextState.showEmojiPicker) {
            return true;
        }

        if (this.state.dropdownOpened !== nextState.dropdownOpened) {
            return true;
        }

        if (nextProps.isEmbedVisible !== this.props.isEmbedVisible) {
            return true;
        }

        if (this.props.previewEnabled !== nextProps.previewEnabled) {
            return true;
        }

        if ((this.state.width !== nextState.width) || this.state.height !== nextState.height) {
            return true;
        }

        if (this.state.hover !== nextState.hover) {
            return true;
        }

        return false;
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

    renderPostTime = (isEphemeral) => {
        const post = this.props.post;

        const isPermalink = !(isEphemeral ||
            Posts.POST_DELETED === post.state ||
            isPostPendingOrFailed(post));

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

    getClassName = (post, isSystemMessage) => {
        let className = 'post post--thread same--root post--comment';

        if (this.props.currentUserId === post.user_id) {
            className += ' current--user';
        }

        if (isSystemMessage) {
            className += ' post--system';
        }

        if (this.props.compactDisplay) {
            className += ' post--compact';
        }

        if (post.is_pinned) {
            className += ' post--pinned';
        }

        if (this.state.dropdownOpened || this.state.showEmojiPicker) {
            className += ' post--hovered';
        }

        if (this.props.isConsecutivePost) {
            className += ' same--user';
        }

        return className;
    };

    handleDropdownOpened = (isOpened) => {
        this.setState({
            dropdownOpened: isOpened,
        });
    };

    getDotMenuRef = () => {
        return this.refs.dotMenu;
    };

    setHover = () => {
        this.setState({hover: true});
    }

    unsetHover = () => {
        this.setState({hover: false});
    }

    render() {
        const {post, isConsecutivePost, isReadOnly, channelIsArchived} = this.props;

        const isEphemeral = isPostEphemeral(post);
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);

        let botIndicator;
        let profilePicture;
        let visibleMessage;

        let userProfile = (
            <UserProfile
                userId={post.user_id}
                isBusy={this.props.isBusy}
                isRHS={true}
                hasMention={true}
            />
        );

        if (!isConsecutivePost) {
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

        let options;
        if (isEphemeral) {
            options = (
                <div className='col col__remove'>
                    {this.createRemovePostButton()}
                </div>
            );
        } else if (!isSystemMessage) {
            const dotMenu = (
                <DotMenu
                    post={this.props.post}
                    location={Locations.RHS_COMMENT}
                    isFlagged={this.props.isFlagged}
                    handleDropdownOpened={this.handleDropdownOpened}
                    handleAddReactionClick={this.toggleEmojiPicker}
                    isReadOnly={isReadOnly || channelIsArchived}
                    enableEmojiPicker={this.props.enableEmojiPicker}
                />
            );

            options = (
                <div
                    ref='dotMenu'
                    className='col col__reply'
                >
                    {dotMenu}
                    {postReaction}
                </div>
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

        const flagIcon = (
            <PostFlagIcon
                location={Locations.RHS_COMMENT}
                postId={post.id}
                isFlagged={this.props.isFlagged}
                isEphemeral={isEphemeral}
            />
        );

        return (
            <div
                ref={'post_body_' + post.id}
                className={this.getClassName(post, isSystemMessage)}
                onMouseOver={this.setHover}
                onMouseLeave={this.unsetHover}
            >
                <div className='post__content'>
                    <div className='post__img'>
                        {profilePicture}
                    </div>
                    <div>
                        <div className='post__header'>
                            <div className='col col__name'>
                                <strong>{userProfile}</strong>
                            </div>
                            {botIndicator}
                            <div className='col'>
                                {this.renderPostTime(isEphemeral)}
                                {pinnedBadge}
                                {flagIcon}
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
