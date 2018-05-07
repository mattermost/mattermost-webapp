// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import PostInfo from 'components/post_view/post_info';
import UserProfile from 'components/user_profile.jsx';

export default class PostHeader extends React.PureComponent {
    static propTypes = {

        /*
         * The post to render the header for
         */
        post: PropTypes.object.isRequired,

        /*
         * The user who created the post
         */
        user: PropTypes.object,

        /*
         * Function called when the comment icon is clicked
         */
        handleCommentClick: PropTypes.func.isRequired,

        /*
         * Function called when the post options dropdown is opened
         */
        handleDropdownOpened: PropTypes.func.isRequired,

        /*
         * Set to render compactly
         */
        compactDisplay: PropTypes.bool,

        /*
         * The method for displaying the post creator's name
         */
        displayNameType: PropTypes.string,

        /*
         * The status of the user who created the post
         */
        status: PropTypes.string,

        /*
         * Set if the post creator is currenlty in a WebRTC call
         */
        isBusy: PropTypes.bool,

        /*
         * The number of replies in the same thread as this post
         */
        replyCount: PropTypes.number,

        /**
         * Set to indicate that this is previous post was not a reply to the same thread
         */
        isFirstReply: PropTypes.bool,

        /*
         * Post identifiers for selenium tests
         */
        lastPostCount: PropTypes.number,

        /**
         * Function to get the post list HTML element
         */
        getPostList: PropTypes.func.isRequired,

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
    }

    render() {
        const post = this.props.post;
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);
        const fromWebhook = post && post.props && post.props.from_webhook === 'true';

        let userProfile = (
            <UserProfile
                user={this.props.user}
                displayNameType={this.props.displayNameType}
                status={this.props.status}
                isBusy={this.props.isBusy}
                hasMention={true}
            />
        );
        let indicator;
        let colon;

        if (fromWebhook) {
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
                        displayNameType={this.props.displayNameType}
                        disablePopover={true}
                    />
                );
            }

            indicator = (
                <div className='bot-indicator'>
                    <FormattedMessage
                        id='post_info.bot'
                        defaultMessage='BOT'
                    />
                </div>
            );
        } else if (fromAutoResponder) {
            userProfile = (
                <UserProfile
                    user={this.props.user}
                    displayNameType={this.props.displayNameType}
                    status={this.props.status}
                    isBusy={this.props.isBusy}
                    hasMention={true}
                />
            );

            indicator = (
                <div className='bot-indicator'>
                    <FormattedMessage
                        id='post_info.auto_responder'
                        defaultMessage='AUTOMATIC REPLY'
                    />
                </div>
            );
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
        }

        if (this.props.compactDisplay) {
            colon = (<strong className='colon'>{':'}</strong>);
        }

        return (
            <div className='post__header'>
                <div className='col col__name'>{userProfile}{colon}</div>
                {indicator}
                <div className='col'>
                    <PostInfo
                        post={post}
                        handleCommentClick={this.props.handleCommentClick}
                        handleDropdownOpened={this.props.handleDropdownOpened}
                        compactDisplay={this.props.compactDisplay}
                        lastPostCount={this.props.lastPostCount}
                        replyCount={this.props.replyCount}
                        isFirstReply={this.props.isFirstReply}
                        showTimeWithoutHover={this.props.showTimeWithoutHover}
                        getPostList={this.props.getPostList}
                        hover={this.props.hover}
                    />
                </div>
            </div>
        );
    }
}
