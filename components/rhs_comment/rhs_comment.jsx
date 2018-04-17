// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Posts} from 'mattermost-redux/constants/index';
import {
    isPostEphemeral,
    isPostPendingOrFailed,
} from 'mattermost-redux/utils/post_utils';
import Permissions from 'mattermost-redux/constants/permissions';

import {addReaction, emitEmojiPosted} from 'actions/post_actions.jsx';
import TeamStore from 'stores/team_store.jsx';
import Constants from 'utils/constants.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import DotMenu from 'components/dot_menu';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FileAttachmentListContainer from 'components/file_attachment_list';
import FailedPostOptions from 'components/post_view/failed_post_options';
import PostFlagIcon from 'components/post_view/post_flag_icon.jsx';
import PostTime from 'components/post_view/post_time.jsx';
import ReactionListContainer from 'components/post_view/reaction_list';
import ProfilePicture from 'components/profile_picture.jsx';
import EmojiIcon from 'components/svg/emoji_icon';
import MattermostLogo from 'components/svg/mattermost_logo';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import MessageWithAdditionalContent from 'components/message_with_additional_content';

import UserProfile from 'components/user_profile.jsx';

export default class RhsComment extends React.Component {
    static propTypes = {
        post: PropTypes.object,
        teamId: PropTypes.string.isRequired,
        lastPostCount: PropTypes.number,
        user: PropTypes.object,
        currentUser: PropTypes.object.isRequired,
        compactDisplay: PropTypes.bool,
        isFlagged: PropTypes.bool,
        status: PropTypes.string,
        isBusy: PropTypes.bool,
        removePost: PropTypes.func.isRequired,
        previewCollapsed: PropTypes.string.isRequired,
        previewEnabled: PropTypes.bool.isRequired,
        isEmbedVisible: PropTypes.bool,
        enableEmojiPicker: PropTypes.bool.isRequired,
        enablePostUsernameOverride: PropTypes.bool.isRequired,
        isReadOnly: PropTypes.bool.isRequired,
        pluginPostTypes: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.state = {
            currentTeamDisplayName: TeamStore.getCurrent().name,
            showEmojiPicker: false,
            dropdownOpened: false,
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.status !== this.props.status) {
            return true;
        }

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

        if (!Utils.areObjectsEqual(nextProps.currentUser, this.props.currentUser)) {
            return true;
        }

        if (this.state.showEmojiPicker !== nextState.showEmojiPicker) {
            return true;
        }

        if (nextProps.lastPostCount !== this.props.lastPostCount) {
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

        if (!Utils.areObjectsEqual(nextProps.user, this.props.user)) {
            return true;
        }

        if ((this.state.width !== nextState.width) || this.state.height !== nextState.height) {
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
            />
        );
    };

    toggleEmojiPicker = () => {
        const showEmojiPicker = !this.state.showEmojiPicker;

        this.setState({
            showEmojiPicker,
            dropdownOpened: showEmojiPicker,
        });
    };

    reactEmojiClick = (emoji) => {
        this.setState({showEmojiPicker: false});
        const emojiName = emoji.name || emoji.aliases[0];
        addReaction(this.props.post.channel_id, this.props.post.id, emojiName);
        emitEmojiPosted(emojiName);
        this.handleDropdownOpened(false);
    };

    getClassName = (post, isSystemMessage) => {
        let className = 'post post--thread';

        if (this.props.currentUser.id === post.user_id) {
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

        if (this.state.dropdownOpened) {
            className += ' post--hovered';
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

    render() {
        const {post, isReadOnly} = this.props;

        let idCount = -1;
        if (this.props.lastPostCount >= 0 && this.props.lastPostCount < Constants.TEST_ID_COUNT) {
            idCount = this.props.lastPostCount;
        }

        const isEphemeral = isPostEphemeral(post);
        const isSystemMessage = PostUtils.isSystemMessage(post);

        let status = this.props.status;
        if (post.props && post.props.from_webhook === 'true') {
            status = null;
        }

        let botIndicator;
        let userProfile = (
            <UserProfile
                user={this.props.user}
                status={status}
                isBusy={this.props.isBusy}
                isRHS={true}
                hasMention={true}
            />
        );

        let visibleMessage;
        if (post.props && post.props.from_webhook) {
            if (post.props.override_username && this.props.enablePostUsernameOverride) {
                userProfile = (
                    <UserProfile
                        user={this.props.user}
                        overwriteName={post.props.override_username}
                        disablePopover={true}
                    />
                );
            } else {
                userProfile = (
                    <UserProfile
                        user={this.props.user}
                        disablePopover={true}
                    />
                );
            }

            botIndicator = <div className='col col__name bot-indicator'>{'BOT'}</div>;
        } else if (isSystemMessage) {
            userProfile = (
                <UserProfile
                    user={{}}
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

        let failedPostOptions;
        let postClass = '';

        if (post.failed) {
            postClass += ' post-failed';
            failedPostOptions = <FailedPostOptions post={this.props.post}/>;
        }

        if (PostUtils.isEdited(this.props.post)) {
            postClass += ' post--edited';
        }

        let profilePic = (
            <ProfilePicture
                src={PostUtils.getProfilePicSrcForPost(post, this.props.user)}
                status={status}
                width='36'
                height='36'
                user={this.props.user}
                isBusy={this.props.isBusy}
                isRHS={true}
                hasMention={true}
            />
        );

        if (post.props && post.props.from_webhook) {
            profilePic = (
                <ProfilePicture
                    src={PostUtils.getProfilePicSrcForPost(post, this.props.user)}
                    width='36'
                    height='36'
                />
            );
        } else if (isSystemMessage) {
            profilePic = (
                <MattermostLogo className='icon'/>
            );
        }

        if (this.props.compactDisplay) {
            if (post.props && post.props.from_webhook) {
                profilePic = (
                    <ProfilePicture
                        src=''
                    />
                );
            } else {
                profilePic = (
                    <ProfilePicture
                        src=''
                        status={status}
                        user={this.props.user}
                        isBusy={this.props.isBusy}
                        isRHS={true}
                        hasMention={true}
                    />
                );
            }
        }

        const profilePicContainer = (<div className='post__img'>{profilePic}</div>);

        let fileAttachment = null;
        if (post.file_ids && post.file_ids.length > 0) {
            fileAttachment = (
                <FileAttachmentListContainer
                    post={post}
                    compactDisplay={this.props.compactDisplay}
                />
            );
        }

        let react;

        if (!isReadOnly && !isEphemeral && !post.failed && !isSystemMessage && this.props.enableEmojiPicker) {
            react = (
                <span>
                    <EmojiPickerOverlay
                        show={this.state.showEmojiPicker}
                        onHide={this.toggleEmojiPicker}
                        target={this.getDotMenuRef}
                        onEmojiClick={this.reactEmojiClick}
                        rightOffset={15}
                        spaceRequiredAbove={342}
                        spaceRequiredBelow={342}
                    />
                    <ChannelPermissionGate
                        channelId={post.channel_id}
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_REACTION]}
                    >
                        <button
                            className='reacticon__container reaction color--link style--none'
                            onClick={this.toggleEmojiPicker}
                            ref={'rhs_reacticon_' + post.id}
                        >
                            <EmojiIcon className='icon icon--emoji'/>
                        </button>
                    </ChannelPermissionGate>
                </span>
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
                    idPrefix={Constants.RHS}
                    isRHS={true}
                    idCount={idCount}
                    post={this.props.post}
                    isFlagged={this.props.isFlagged}
                    handleDropdownOpened={this.handleDropdownOpened}
                    isReadOnly={isReadOnly}
                />
            );

            options = (
                <div
                    ref='dotMenu'
                    className='col col__reply'
                >
                    {dotMenu}
                    {react}
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

        return (
            <div
                ref={'post_body_' + post.id}
                className={this.getClassName(post, isSystemMessage)}
            >
                <div className='post__content'>
                    {profilePicContainer}
                    <div>
                        <div className='post__header'>
                            <div className='col col__name'>
                                <strong>{userProfile}</strong>
                            </div>
                            {botIndicator}
                            <div className='col'>
                                {this.renderPostTime(isEphemeral)}
                                {pinnedBadge}
                                <PostFlagIcon
                                    idPrefix={'rhsCommentFlag'}
                                    idCount={idCount}
                                    postId={post.id}
                                    isFlagged={this.props.isFlagged}
                                    isEphemeral={isEphemeral}
                                />
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
                            <ReactionListContainer
                                post={post}
                                isReadOnly={isReadOnly}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
