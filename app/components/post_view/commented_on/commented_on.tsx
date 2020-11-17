// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';

import {UserProfile as UserProfileType} from 'mattermost-redux/types/users';

import {Post} from 'mattermost-redux/types/posts';

import * as Utils from 'utils/utils.jsx';
import {stripMarkdown} from 'utils/markdown';

import CommentedOnFilesMessage from 'components/post_view/commented_on_files_message';
import UserProfile from '../../user_profile/user_profile';

type Props = {
    displayName?: string;
    enablePostUsernameOverride?: boolean;
    parentPostUser?: UserProfileType;
    onCommentClick?: React.EventHandler<React.MouseEvent>;
    post: Post;
}

export default class CommentedOn extends PureComponent<Props> {
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
        let message: React.ReactNode = '';
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
                        {typeof message === 'string' ? stripMarkdown(message) : message}
                    </a>
                </span>
            </div>
        );
    }
}
