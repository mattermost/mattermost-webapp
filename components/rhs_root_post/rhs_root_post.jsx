// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Posts} from 'mattermost-redux/constants';
import * as ReduxPostUtils from 'mattermost-redux/utils/post_utils';
import Permissions from 'mattermost-redux/constants/permissions';

import {emitEmojiPosted} from 'actions/post_actions.jsx';
import Constants from 'utils/constants.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import DotMenu from 'components/dot_menu';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FileAttachmentListContainer from 'components/file_attachment_list';
import PostProfilePicture from 'components/post_profile_picture';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import ReactionListContainer from 'components/post_view/reaction_list';
import PostTime from 'components/post_view/post_time.jsx';
import EmojiIcon from 'components/svg/emoji_icon';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import MessageWithAdditionalContent from 'components/message_with_additional_content';

import UserProfile from 'components/user_profile.jsx';

export default class RhsRootPost extends React.Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        teamId: PropTypes.string.isRequired,
        currentUser: PropTypes.object.isRequired,
        compactDisplay: PropTypes.bool,
        commentCount: PropTypes.number.isRequired,
        isFlagged: PropTypes.bool,
        status: PropTypes.string,
        previewCollapsed: PropTypes.string,
        previewEnabled: PropTypes.bool,
        isBusy: PropTypes.bool,
        isEmbedVisible: PropTypes.bool,
        enableEmojiPicker: PropTypes.bool.isRequired,
        enablePostUsernameOverride: PropTypes.bool.isRequired,
        isReadOnly: PropTypes.bool.isRequired,
        pluginPostTypes: PropTypes.object,
        channelIsArchived: PropTypes.bool.isRequired,
        channelType: PropTypes.string,
        channelDisplayName: PropTypes.string,
        actions: PropTypes.shape({
            addReaction: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        commentCount: 0,
    };

    constructor(props) {
        super(props);

        this.state = {
            showEmojiPicker: false,
            testStateObj: true,
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

        if (nextProps.isEmbedVisible !== this.props.isEmbedVisible) {
            return true;
        }

        if (nextProps.previewEnabled !== this.props.previewEnabled) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextProps.post, this.props.post)) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextProps.user, this.props.user)) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextProps.currentUser, this.props.currentUser)) {
            return true;
        }

        if (this.state.showEmojiPicker !== nextState.showEmojiPicker) {
            return true;
        }

        if (this.state.dropdownOpened !== nextState.dropdownOpened) {
            return true;
        }

        if (this.props.previewCollapsed !== nextProps.previewCollapsed) {
            return true;
        }

        if ((this.state.width !== nextState.width) || this.state.height !== nextState.height) {
            return true;
        }

        return false;
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
        this.setState({
            dropdownOpened: false,
            showEmojiPicker: false,
        });
        const emojiName = emoji.name || emoji.aliases[0];
        this.props.actions.addReaction(this.props.post.id, emojiName);
        emitEmojiPosted(emojiName);
    };

    getClassName = (post, isSystemMessage) => {
        let className = 'post post--root post--thread';
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
        const {post, user, isReadOnly, teamId, channelIsArchived, channelType, channelDisplayName} = this.props;

        const isEphemeral = Utils.isPostEphemeral(post);
        const isSystemMessage = PostUtils.isSystemMessage(post);

        let channelName;
        if (channelType === 'D') {
            channelName = (
                <FormattedMessage
                    id='rhs_root.direct'
                    defaultMessage='Direct Message'
                />
            );
        } else {
            channelName = channelDisplayName;
        }

        let react;

        if (!isReadOnly && !isEphemeral && !post.failed && !isSystemMessage && this.props.enableEmojiPicker && !channelIsArchived) {
            react = (
                <ChannelPermissionGate
                    channelId={post.channel_id}
                    teamId={teamId}
                    permissions={[Permissions.ADD_REACTION]}
                >
                    <div>
                        <EmojiPickerOverlay
                            show={this.state.showEmojiPicker}
                            onHide={this.toggleEmojiPicker}
                            target={this.getDotMenuRef}
                            onEmojiClick={this.reactEmojiClick}
                            rightOffset={15}
                            spaceRequiredAbove={EmojiPickerOverlay.RHS_SPACE_REQUIRED_ABOVE}
                            spaceRequiredBelow={EmojiPickerOverlay.RHS_SPACE_REQUIRED_BELOW}
                        />
                        <button
                            className='reacticon__container reaction color--link style--none'
                            onClick={this.toggleEmojiPicker}
                            ref='rhs_root_reacticon'
                        >
                            <EmojiIcon className='icon icon--emoji'/>
                        </button>
                    </div>
                </ChannelPermissionGate>
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
        } else if (post.props && post.props.from_webhook) {
            if (post.props.override_username && this.props.enablePostUsernameOverride) {
                userProfile = (
                    <UserProfile
                        user={user}
                        overwriteName={post.props.override_username}
                        disablePopover={true}
                    />
                );
            } else {
                userProfile = (
                    <UserProfile
                        user={user}
                        disablePopover={true}
                    />
                );
            }

            botIndicator = <div className='col col__name bot-indicator'>{'BOT'}</div>;
        } else {
            userProfile = (
                <UserProfile
                    user={user}
                    status={this.props.status}
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

        const dotMenu = (
            <DotMenu
                post={this.props.post}
                location={'RHS_ROOT'}
                isFlagged={this.props.isFlagged}
                handleDropdownOpened={this.handleDropdownOpened}
                commentCount={this.props.commentCount}
                isReadOnly={isReadOnly || channelIsArchived}
            />
        );

        let dotMenuContainer;
        if (this.props.post.type !== Constants.PostTypes.FAKE_PARENT_DELETED) {
            dotMenuContainer = (
                <div
                    ref='dotMenu'
                    className='col col__reply'
                >
                    {dotMenu}
                    {react}
                </div>
            );
        }

        let postFlagIcon;
        if (this.props.post.type !== Constants.PostTypes.FAKE_PARENT_DELETED) {
            postFlagIcon = (
                <PostFlagIcon
                    idPrefix={'rhsRootPostFlag'}
                    postId={post.id}
                    isFlagged={this.props.isFlagged}
                />
            );
        }

        return (
            <div
                id='thread--root'
                className={this.getClassName(post, isSystemMessage)}
            >
                <div className='post-right-channel__name'>{channelName}</div>
                <div className='post__content'>
                    <div className='post__img'>
                        <PostProfilePicture
                            compactDisplay={this.props.compactDisplay}
                            isBusy={this.props.isBusy}
                            isRHS={true}
                            post={post}
                            status={this.props.status}
                            user={this.props.user}
                        />
                    </div>
                    <div>
                        <div className='post__header'>
                            <div className='col__name'>{userProfile}</div>
                            {botIndicator}
                            <div className='col'>
                                {this.renderPostTime(isEphemeral)}
                                {pinnedBadge}
                                {postFlagIcon}
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
                            <ReactionListContainer
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
