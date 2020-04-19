// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants';
import * as PostUtils from 'utils/post_utils.jsx';
import PostInfo from 'components/post_view/post_info';
import UserProfile from 'components/user_profile';
import BotBadge from 'components/widgets/badges/bot_badge';
import Badge from 'components/widgets/badges/badge';

export default class PostHeader extends React.PureComponent {
    static propTypes = {

        /*
         * The post to render the header for
         */
        post: PropTypes.object.isRequired,

        /*
         * Function called when the comment icon is clicked
         */
        handleCommentClick: PropTypes.func.isRequired,

        /*
         * Function called when the card icon is clicked
         */
        handleCardClick: PropTypes.func.isRequired,

        /*
         * Function called when the post options dropdown is opened
         */
        handleDropdownOpened: PropTypes.func.isRequired,

        /*
         * Set to render compactly
         */
        compactDisplay: PropTypes.bool,

        /*
         * The number of replies in the same thread as this post
         */
        replyCount: PropTypes.number,

        /**
         * Set to indicate that this is previous post was not a reply to the same thread
         */
        isFirstReply: PropTypes.bool,

        /**
         * Set to mark post as being hovered over
         */
        hover: PropTypes.bool.isRequired,

        /*
         * Set to render the post time when not hovering
         */
        showTimeWithoutHover: PropTypes.bool,

        /**
         * Whether or not the post username can be overridden.
         */
        enablePostUsernameOverride: PropTypes.bool.isRequired,

        /**
         * If the user that made the post is a bot.
         */
        isBot: PropTypes.bool.isRequired,

        /**
         * If the user that made the post is a guest.
         */
        isGuest: PropTypes.bool.isRequired,

        /**
         * To Check if the current post is last in the list
         */
        isLastPost: PropTypes.bool,

    }

    render() {
        const {post} = this.props;
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);
        const fromWebhook = post && post.props && post.props.from_webhook === 'true';

        let userProfile = (
            <UserProfile
                userId={post.user_id}
                hasMention={true}
            />
        );
        let indicator;
        let colon;

        if (fromWebhook && !this.props.isBot) {
            if (post.props.override_username && this.props.enablePostUsernameOverride) {
                userProfile = (
                    <UserProfile
                        userId={post.user_id}
                        hideStatus={true}
                        overwriteName={post.props.override_username}
                    />
                );
            } else {
                userProfile = (
                    <UserProfile
                        userId={post.user_id}
                        hideStatus={true}
                    />
                );
            }

            indicator = (<BotBadge/>);
        } else if (fromAutoResponder) {
            userProfile = (
                <UserProfile
                    userId={post.user_id}
                    hideStatus={true}
                    hasMention={true}
                />
            );

            indicator = (
                <Badge>
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
        }

        if (this.props.compactDisplay) {
            colon = (<strong className='colon'>{':'}</strong>);
        }

        return (
            <div className='post__header'>
                <div className='col col__name'>
                    {userProfile}
                    {colon}
                    {indicator}
                </div>
                <div className='col'>
                    <PostInfo
                        post={post}
                        handleCommentClick={this.props.handleCommentClick}
                        handleCardClick={this.props.handleCardClick}
                        handleDropdownOpened={this.props.handleDropdownOpened}
                        compactDisplay={this.props.compactDisplay}
                        replyCount={this.props.replyCount}
                        isFirstReply={this.props.isFirstReply}
                        showTimeWithoutHover={this.props.showTimeWithoutHover}
                        hover={this.props.hover}
                        isLastPost={this.props.isLastPost}
                    />
                </div>
            </div>
        );
    }
}
