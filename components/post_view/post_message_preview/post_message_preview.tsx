// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {Post, PostPreviewMetadata} from 'mattermost-redux/types/posts';
import UserProfileComponent from 'components/user_profile';
import {UserProfile} from 'mattermost-redux/types/users';
import Avatar from 'components/widgets/users/avatar';
import * as Utils from 'utils/utils';
import PostMessageView from 'components/post_view/post_message_view';
import FileAttachmentListContainer from 'components/file_attachment_list';

import Timestamp from 'components/timestamp';
import PostAttachmentContainer from '../post_attachment_container/post_attachment_container';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';

export type Props = {
    user?: UserProfile;
    post?: Post;
    metadata: PostPreviewMetadata;
};
export default class PostMessagePreview extends React.PureComponent<Props> {
    render() {
        const {user, metadata, post} = this.props;
        if (post && user) {
            let fileAttachmentHolder = null;
            if (((post.file_ids && post.file_ids.length > 0) || (post.filenames && post.filenames.length > 0))) {
                fileAttachmentHolder = (
                    <FileAttachmentListContainer
                        post={post}
                        compactDisplay={false}
                    />
                );
            }
            return (
                <PostAttachmentContainer
                    className='permalink'
                    link={`/${metadata.team_name}/pl/${metadata.id}`}
                >
                    <div className='post-preview'>
                        <div className='post-preview__header'>
                            <div className='col col__name'>
                                <div className='post__img'>
                                    <span className='profile-icon'>
                                        <Avatar
                                            username={user?.username}
                                            size={'sm'}
                                            url={Utils.imageURLForUser(user?.id)}
                                            className={'avatar-post-preview'}
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className='col col__name'>
                                <UserProfileComponent
                                    userId={user?.id}
                                    hasMention={true}
                                    disablePopover={true}
                                />
                            </div>
                            <div className='col'>
                                <Timestamp
                                    value={post?.create_at}
                                    units={[
                                        'now',
                                        'minute',
                                        'hour',
                                        'day',
                                    ]}
                                    useTime={false}
                                    day={'numeric'}
                                    className='post-preview__time'
                                />
                            </div>
                        </div>
                        <PostBodyAdditionalContent
                            post={post}
                            appsEnabled={true}
                        >
                            <PostMessageView
                                post={post}
                                attachmentTextOverflowType='ellipsis'
                            />
                        </PostBodyAdditionalContent>
                        {fileAttachmentHolder}

                        <div className='post__preview-footer'>
                            <p>
                                <FormattedMessage
                                    id='post_message_preview.channel'
                                    defaultMessage='Originally posted in ~{channel}'
                                    values={{
                                        channel: metadata?.channel_display_name,
                                    }}
                                />
                            </p>
                        </div>
                    </div>
                </PostAttachmentContainer>
            );
        }
        return null;
    }
}
