// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedDate, FormattedMessage} from 'react-intl';
import {browserHistory, Link} from 'react-router';

import PostMessageContainer from 'components/post_view/post_message_view';
import FileAttachmentListContainer from 'components/file_attachment_list';
import CommentIcon from 'components/common/comment_icon.jsx';
import DotMenu from 'components/dot_menu';
import ProfilePicture from 'components/profile_picture.jsx';
import UserProfile from 'components/user_profile.jsx';
import PostFlagIcon from 'components/post_view/post_flag_icon.jsx';

import Constants from 'utils/constants.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';

export default class SearchResultsItem extends React.PureComponent {
    static propTypes = {

        /**
        *  Data used for rendering post
        */
        post: PropTypes.object,

        /**
        *  count used for passing down to PostFlagIcon, DotMenu and CommentIcon
        */
        lastPostCount: PropTypes.number,

        /**
        *  user object for rendering profile_picture
        */
        user: PropTypes.object,

        /**
        *  channel object for rendering channel name on top of result
        */
        channel: PropTypes.object,

        /**
        *  Flag for determining result display setting
        */
        compactDisplay: PropTypes.bool,

        /**
        *  Flag for highlighting mentions
        */
        isMentionSearch: PropTypes.bool,

        /**
        *  Flag for highlighting search term
        */
        term: PropTypes.string,

        /**
        *  Flag for determining time format
        */
        useMilitaryTime: PropTypes.bool.isRequired,

        /**
        *  Flag for determining result flag state
        */
        isFlagged: PropTypes.bool,

        /**
        *  Flag for determining profile busy status
        */
        isBusy: PropTypes.bool,

        /**
        *  Data used for status in profile
        */
        status: PropTypes.string,

        /**
        *  Data used creating URl for jump to post
        */
        currentTeamName: PropTypes.string,

        /**
        *  Function used for shrinking LHS
        *  on click of jump to message in expanded mode
        */
        shrink: PropTypes.func,

        /**
        *  Function used for selecting a post to comment
        */
        onSelect: PropTypes.func,

        /**
        *  Function used for closing LHS
        */
        actions: PropTypes.shape({
            emitCloseRightHandSide: PropTypes.func.isRequired
        }).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            dropdownOpened: false
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.setDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setDimensions);
    }

    setDimensions = () => {
        this.setState({
            ...Utils.getWindowDimensions()
        });
    }

    shrinkSidebar() {
        setTimeout(() => {
            this.props.shrink();
        });
    }

    handleFocusRHSClick = (e) => {
        e.preventDefault();
        this.props.onSelect(this.props.post);
    }

    handleJumpClick = () => {
        if (Utils.isMobile()) {
            this.props.actions.emitCloseRightHandSide();
        }

        this.shrinkSidebar();
        browserHistory.push(`/${this.props.currentTeamName}/pl/${this.props.post.id}`);
    }

    handleDropdownOpened = (isOpened) => {
        this.setState({
            dropdownOpened: isOpened
        });
    }

    timeTag(post) {
        const date = Utils.getDateForUnixTicks(post.create_at);

        return (
            <time
                className='search-item-time'
                dateTime={date.toISOString()}
                title={date}
            >
                <FormattedDate
                    value={post.create_at}
                    hour12={!this.props.useMilitaryTime}
                    hour='2-digit'
                    minute='2-digit'
                />
            </time>
        );
    }

    renderTimeTag(post) {
        return Utils.isMobile() ?
            this.timeTag(post) :
            (
                <Link
                    to={`/${this.props.currentTeamName}/pl/${post.id}`}
                    target='_blank'
                    className='post__permalink'
                >
                    {this.timeTag(post)}
                </Link>
            );
    }

    getClassName = () => {
        let className = 'post post--thread';

        if (this.props.compactDisplay) {
            className += ' post--compact';
        }

        if (this.state.dropdownOpened) {
            className += ' post--hovered';
        }

        return className;
    }

    render() {
        let channelName = null;
        const channel = this.props.channel;
        const user = this.props.user || {};
        const post = this.props.post;

        if (channel) {
            channelName = channel.display_name;
            if (channel.type === Constants.DM_CHANNEL) {
                channelName = (
                    <FormattedMessage
                        id='search_item.direct'
                        defaultMessage='Direct Message (with {username})'
                        values={{
                            username: Utils.displayUsernameForUser(Utils.getDirectTeammate(channel.id))
                        }}
                    />
                );
            }
        }

        let overrideUsername;
        let disableProfilePopover = false;
        if (post.props &&
                post.props.from_webhook &&
                post.props.override_username &&
                global.window.mm_config.EnablePostUsernameOverride === 'true') {
            overrideUsername = post.props.override_username;
            disableProfilePopover = true;
        }

        let botIndicator;
        if (post.props && post.props.from_webhook) {
            botIndicator = <div className='bot-indicator'>{Constants.BOT_NAME}</div>;
        }

        const profilePic = (
            <ProfilePicture
                src={PostUtils.getProfilePicSrcForPost(post, user)}
                user={this.props.user}
                status={this.props.status}
                isBusy={this.props.isBusy}
            />

        );

        const profilePicContainer = (<div className='post__img'>{profilePic}</div>);

        let postClass = '';
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

        let message;
        let flagContent;
        let rhsControls;
        if (post.state === Constants.POST_DELETED) {
            message = (
                <p>
                    <FormattedMessage
                        id='post_body.deleted'
                        defaultMessage='(message deleted)'
                    />
                </p>
            );
        } else {
            flagContent = (
                <PostFlagIcon
                    idPrefix={'searchPostFlag'}
                    idCount={this.props.lastPostCount}
                    postId={post.id}
                    isFlagged={this.props.isFlagged}
                />
            );

            rhsControls = (
                <div className='col__controls'>
                    <DotMenu
                        idPrefix={Constants.SEARCH_POST}
                        idCount={this.props.lastPostCount}
                        post={post}
                        isFlagged={this.props.isFlagged}
                        handleDropdownOpened={this.handleDropdownOpened}
                    />
                    <CommentIcon
                        idPrefix={'searchCommentIcon'}
                        idCount={this.props.lastPostCount}
                        handleCommentClick={this.handleFocusRHSClick}
                        searchStyle={'search-item__comment'}
                    />
                    <a
                        onClick={this.handleJumpClick}
                        className='search-item__jump'
                    >
                        <FormattedMessage
                            id='search_item.jump'
                            defaultMessage='Jump'
                        />
                    </a>
                </div>
            );

            message = (
                <PostMessageContainer
                    post={post}
                    options={{
                        searchTerm: this.props.term,
                        mentionHighlight: this.props.isMentionSearch
                    }}
                />
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
            <div className='search-item__container'>
                <div className='date-separator'>
                    <hr className='separator__hr'/>
                    <div className='separator__text'>
                        <FormattedDate
                            value={post.create_at}
                            day='numeric'
                            month='long'
                            year='numeric'
                        />
                    </div>
                </div>
                <div className={this.getClassName()}>
                    <div className='search-channel__name'>{channelName}</div>
                    <div className='post__content'>
                        {profilePicContainer}
                        <div>
                            <div className='post__header'>
                                <div className='col col__name'>
                                    <strong>
                                        <UserProfile
                                            user={user}
                                            overwriteName={overrideUsername}
                                            disablePopover={disableProfilePopover}
                                            status={this.props.status}
                                            isBusy={this.props.isBusy}
                                        />
                                    </strong>
                                </div>
                                {botIndicator}
                                <div className='col'>
                                    {this.renderTimeTag(post)}
                                    {pinnedBadge}
                                    {flagContent}
                                </div>
                                {rhsControls}
                            </div>
                            <div className='search-item-snippet post__body'>
                                <div className={postClass}>
                                    {message}
                                    {fileAttachment}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
