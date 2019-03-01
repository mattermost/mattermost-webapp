// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Posts} from 'mattermost-redux/constants/index';
import * as ReduxPostUtils from 'mattermost-redux/utils/post_utils';

import PostMessageContainer from 'components/post_view/post_message_view';
import FileAttachmentListContainer from 'components/file_attachment_list';
import CommentIcon from 'components/common/comment_icon.jsx';
import DotMenu from 'components/dot_menu';
import PostProfilePicture from 'components/post_profile_picture';
import UserProfile from 'components/user_profile';
import DateSeparator from 'components/post_view/date_separator.jsx';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import ArchiveIcon from 'components/svg/archive_icon';
import PostTime from 'components/post_view/post_time';
import {browserHistory} from 'utils/browser_history';

import Constants, {Locations} from 'utils/constants.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';

export default class SearchResultsItem extends React.PureComponent {
    static propTypes = {

        /**
        *  Data used for rendering post
        */
        post: PropTypes.object,

        /**
        * An array of strings in this post that were matched by the search
        */
        matches: PropTypes.array,

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
        *  Flag for determining result flag state
        */
        isFlagged: PropTypes.bool,

        /**
        *  Data used creating URl for jump to post
        */
        currentTeamName: PropTypes.string,

        /**
        *  Data used for delete in DotMenu
        */
        commentCountForPost: PropTypes.number,

        /**
         * Whether post username overrides are to be respected.
         */
        enablePostUsernameOverride: PropTypes.bool.isRequired,

        /**
        *  Function used for closing LHS
        */
        actions: PropTypes.shape({
            closeRightHandSide: PropTypes.func.isRequired,
            selectPost: PropTypes.func.isRequired,
            setRhsExpanded: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            dropdownOpened: false,
        };
    }

    handleFocusRHSClick = (e) => {
        e.preventDefault();
        this.props.actions.selectPost(this.props.post);
    };

    handleJumpClick = () => {
        if (Utils.isMobile()) {
            this.props.actions.closeRightHandSide();
        }

        this.props.actions.setRhsExpanded(false);
        browserHistory.push(`/${this.props.currentTeamName}/pl/${this.props.post.id}`);
    };

    handleDropdownOpened = (isOpened) => {
        this.setState({
            dropdownOpened: isOpened,
        });
    };

    renderPostTime = () => {
        const post = this.props.post;

        const isPermalink = !(Posts.POST_DELETED === post.state ||
            ReduxPostUtils.isPostPendingOrFailed(post));

        return (
            <PostTime
                isPermalink={isPermalink}
                eventTime={post.create_at}
                postId={post.id}
                location={Locations.SEARCH}
            />
        );
    };

    getClassName = () => {
        let className = 'post post--thread';

        if (this.props.compactDisplay) {
            className += ' post--compact';
        }

        if (this.state.dropdownOpened) {
            className += ' post--hovered';
        }

        return className;
    };

    render() {
        let channelName = null;
        const {channel, post} = this.props;

        const channelIsArchived = channel ? channel.delete_at !== 0 : true;

        if (channel) {
            channelName = channel.display_name;
            if (channel.type === Constants.DM_CHANNEL) {
                channelName = (
                    <FormattedMessage
                        id='search_item.direct'
                        defaultMessage='Direct Message (with {username})'
                        values={{
                            username: Utils.getDisplayNameByUser(Utils.getDirectTeammate(channel.id)),
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
            this.props.enablePostUsernameOverride) {
            overrideUsername = post.props.override_username;
            disableProfilePopover = true;
        }

        let botIndicator;
        if (post.props && post.props.from_webhook) {
            botIndicator = (
                <div className='bot-indicator'>
                    <FormattedMessage
                        id='post_info.bot'
                        defaultMessage='BOT'
                    />
                </div>
            );
        }

        const profilePic = (
            <PostProfilePicture
                compactDisplay={this.props.compactDisplay}
                post={post}
                userId={post.user_id}
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
                    location={Locations.SEARCH}
                    postId={post.id}
                    isFlagged={this.props.isFlagged}
                />
            );

            rhsControls = (
                <div className='col__controls col__reply'>
                    <DotMenu
                        post={post}
                        location={Locations.SEARCH}
                        isFlagged={this.props.isFlagged}
                        handleDropdownOpened={this.handleDropdownOpened}
                        commentCount={this.props.commentCountForPost}
                        isReadOnly={channelIsArchived || null}
                    />
                    <CommentIcon
                        location={Locations.SEARCH}
                        handleCommentClick={this.handleFocusRHSClick}
                        postId={post.id}
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
                <PostBodyAdditionalContent
                    post={post}
                    options={{
                        searchTerm: this.props.term,
                        searchMatches: this.props.matches,
                    }}
                >
                    <PostMessageContainer
                        post={post}
                        options={{
                            searchTerm: this.props.term,
                            searchMatches: this.props.matches,
                            mentionHighlight: this.props.isMentionSearch,
                        }}
                    />
                </PostBodyAdditionalContent>
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

        const currentPostDay = Utils.getDateForUnixTicks(post.create_at);

        return (
            <div className='search-item__container'>
                <DateSeparator date={currentPostDay}/>
                <div className={this.getClassName()}>
                    <div className='search-channel__name'>
                        {channelName}
                        {channelIsArchived &&
                            <span className='search-channel__archived'>
                                <ArchiveIcon className='icon icon__archive channel-header-archived-icon svg-text-color'/>
                                <FormattedMessage
                                    id='search_item.channelArchived'
                                    defaultMessage='Archived'
                                />
                            </span>
                        }
                    </div>
                    <div className='post__content'>
                        {profilePicContainer}
                        <div>
                            <div className='post__header'>
                                <div className='col col__name'>
                                    <strong>
                                        <UserProfile
                                            userId={post.user_id}
                                            overwriteName={overrideUsername}
                                            disablePopover={disableProfilePopover}
                                            isRHS={true}
                                        />
                                    </strong>
                                </div>
                                {botIndicator}
                                <div className='col'>
                                    {this.renderPostTime()}
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
