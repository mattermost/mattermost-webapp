// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Posts} from 'mattermost-redux/constants';
import * as ReduxPostUtils from 'mattermost-redux/utils/post_utils';

import {addReaction, emitEmojiPosted} from 'actions/post_actions.jsx';
import UserStore from 'stores/user_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import Constants from 'utils/constants.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import DotMenu from 'components/dot_menu';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FileAttachmentListContainer from 'components/file_attachment_list';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostFlagIcon from 'components/post_view/post_flag_icon.jsx';
import PostMessageContainer from 'components/post_view/post_message_view';
import ReactionListContainer from 'components/post_view/reaction_list';
import PostTime from 'components/post_view/post_time.jsx';
import ProfilePicture from 'components/profile_picture.jsx';
import EmojiIcon from 'components/svg/emoji_icon';
import MattermostLogo from 'components/svg/mattermost_logo';

import UserProfile from 'components/user_profile.jsx';

export default class RhsRootPost extends React.Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,
        compactDisplay: PropTypes.bool,
        useMilitaryTime: PropTypes.bool.isRequired,
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
    };

    static defaultProps = {
        commentCount: 0,
    };

    constructor(props) {
        super(props);

        this.state = {
            currentTeamDisplayName: TeamStore.getCurrent().name,
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

        if (nextProps.useMilitaryTime !== this.props.useMilitaryTime) {
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
                useMilitaryTime={this.props.useMilitaryTime}
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
        let className = 'post post--root post--thread';
        if (UserStore.getCurrentId() === post.user_id) {
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
        const {post, user, isReadOnly} = this.props;
        var channel = ChannelStore.get(post.channel_id);

        const isEphemeral = Utils.isPostEphemeral(post);
        const isSystemMessage = PostUtils.isSystemMessage(post);

        var channelName;
        if (channel) {
            if (channel.type === 'D') {
                channelName = (
                    <FormattedMessage
                        id='rhs_root.direct'
                        defaultMessage='Direct Message'
                    />
                );
            } else {
                channelName = channel.display_name;
            }
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
                    <button
                        className='reacticon__container reaction color--link style--none'
                        onClick={this.toggleEmojiPicker}
                        ref='rhs_root_reacticon'
                    >
                        <EmojiIcon className='icon icon--emoji'/>
                    </button>
                </span>

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

        let status = this.props.status;
        if (post.props && post.props.from_webhook === 'true') {
            status = null;
        }

        let profilePic;
        if (isSystemMessage) {
            profilePic = (
                <MattermostLogo className='icon'/>
            );
        } else if (post.props && post.props.from_webhook) {
            profilePic = (
                <ProfilePicture
                    src={PostUtils.getProfilePicSrcForPost(post, user)}
                    width='36'
                    height='36'
                />
            );
        } else {
            profilePic = (
                <ProfilePicture
                    src={PostUtils.getProfilePicSrcForPost(post, user)}
                    status={status}
                    width='36'
                    height='36'
                    user={this.props.user}
                    isBusy={this.props.isBusy}
                    isRHS={true}
                    hasMention={true}
                />
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

        let postClass = '';
        if (PostUtils.isEdited(this.props.post)) {
            postClass += ' post--edited';
        }

        const profilePicContainer = (<div className='post__img'>{profilePic}</div>);

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
                idPrefix={Constants.RHS_ROOT}
                post={this.props.post}
                isFlagged={this.props.isFlagged}
                handleDropdownOpened={this.handleDropdownOpened}
                commentCount={this.props.commentCount}
                isReadOnly={isReadOnly}
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
                    {profilePicContainer}
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
                                <PostBodyAdditionalContent
                                    post={post}
                                    previewCollapsed={this.props.previewCollapsed}
                                    previewEnabled={this.props.previewEnabled}
                                    isEmbedVisible={this.props.isEmbedVisible}
                                >
                                    <PostMessageContainer
                                        post={post}
                                        isRHS={true}
                                        hasMention={true}
                                    />
                                </PostBodyAdditionalContent>
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
