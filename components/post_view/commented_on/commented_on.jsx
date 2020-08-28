// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import {stripMarkdown} from 'utils/markdown';

import CommentedOnFilesMessage from 'components/post_view/commented_on_files_message';
import UserProfile from '../../user_profile/user_profile';

export default class CommentedOn extends PureComponent {
    static propTypes = {
        displayName: PropTypes.string,
        enablePostUsernameOverride: PropTypes.bool,
        parentPostUser: PropTypes.object,
        onCommentClick: PropTypes.func.isRequired,
        post: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            showSearchResults: PropTypes.func.isRequired,
            updateSearchTerms: PropTypes.func.isRequired,
        }).isRequired,
    }

    makeUsername = () => {
        const postProps = this.props.post.props;
        let username = this.props.displayName;
        if (this.props.enablePostUsernameOverride && postProps && postProps.from_webhook === 'true' && postProps.override_username) {
            username = postProps.override_username;
        }
        return username;
    }

    makeCommentedOnMessage = () => {
        const {post} = this.props;
        let message = '';
        if (post.message) {
            message = Utils.replaceHtmlEntities(post.message);
        } else if (post.file_ids && post.file_ids.length > 0) {
            message = (
                <CommentedOnFilesMessage parentPostId={post.id}/>
            );
        } else if (post.props && post.props.attachments && post.props.attachments.length > 0) {
            const attachment = post.props.attachments[0];
            const webhookMessage = attachment.pretext || attachment.title || attachment.text || attachment.fallback || '';
            message = Utils.replaceHtmlEntities(webhookMessage);
        }

        return message;
    }

    render() {
        const username = this.makeUsername();
        const message = this.makeCommentedOnMessage();
        const parentPostUser = this.props.parentPostUser;
        const parentPostUserId = parentPostUser && parentPostUser.id;

        const parentUserProfile = (
            <UserProfile
                user={parentPostUser}
                userId={parentPostUserId}
                displayName={username}
                hasMention={true}
                disablePopover={false}
            />
        );

        return (
            <div
                data-testid='post-link'
                className='post__link'
            >
                <span>
                    <FormattedMessage
                        id='post_body.commentedOn'
                        defaultMessage="Commented on {name}'s message: "
                        values={{
                            name: <a className='theme user_name'>{parentUserProfile}</a>,
                        }}
                    />
                    <a
                        className='theme'
                        onClick={this.props.onCommentClick}
                    >
                        {stripMarkdown(message)}
                    </a>
                </span>
            </div>
        );
    }
}
