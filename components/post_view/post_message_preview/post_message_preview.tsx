// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {Post, PostPreviewMetadata} from 'mattermost-redux/types/posts';
import UserProfileComponent from 'components/user_profile';
import {UserProfile} from 'mattermost-redux/types/users';
import Avatar from 'components/widgets/users/avatar';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils';
import PostMessageView from 'components/post_view/post_message_view';

import Timestamp from 'components/timestamp';
import PostAttachmentContainer from '../post_attachment_container/post_attachment_container';
import MattermostLogo from 'components/widgets/icons/mattermost_logo';
import {Constants} from 'utils/constants';

export type Props = {
    user: UserProfile | null;
    previewPost?: Post;
    metadata: PostPreviewMetadata;
    hasImageProxy: boolean;
    enablePostIconOverride: boolean;
};

const PostMessagePreview = (props: Props) => {
    const {user, metadata, previewPost} = props;

    const getPostIconURL = (defaultURL: string, fromAutoResponder: boolean, fromWebhook: boolean): string => {
        const {enablePostIconOverride, hasImageProxy, previewPost} = props;
        const postProps = previewPost?.props;
        let postIconOverrideURL = '';
        let useUserIcon = '';
        if (postProps) {
            postIconOverrideURL = postProps.override_icon_url;
            useUserIcon = postProps.use_user_icon;
        }

        if (!fromAutoResponder && fromWebhook && !useUserIcon && enablePostIconOverride) {
            if (postIconOverrideURL && postIconOverrideURL !== '') {
                return PostUtils.getImageSrc(postIconOverrideURL, hasImageProxy);
            }
            return Constants.DEFAULT_WEBHOOK_LOGO;
        }

        return defaultURL;
    };

    if (!previewPost) {
        return null;
    }

    const isBot = Boolean(user && user.is_bot);
    const isSystemMessage = PostUtils.isSystemMessage(previewPost);
    const fromWebhook = PostUtils.isFromWebhook(previewPost);
    const fromAutoResponder = PostUtils.fromAutoResponder(previewPost);
    const profileSrc = Utils.imageURLForUser(user?.id ?? '');
    const src = getPostIconURL(profileSrc, fromAutoResponder, fromWebhook);

    let avatar = (
        <Avatar
            size={'sm'}
            url={src}
            className={'avatar-post-preview'}
        />
    );
    if (isSystemMessage && !fromWebhook && !isBot) {
        avatar = (<MattermostLogo className='icon'/>);
    } else if (user?.id) {
        avatar = (
            <Avatar
                username={user.username}
                size={'sm'}
                url={src}
                className={'avatar-post-preview'}
            />
        );
    }

    return (
        <PostAttachmentContainer
            className='permalink'
            link={`/${metadata.team_name}/pl/${metadata.post_id}`}
        >
            <div className='post-preview'>
                <div className='post-preview__header'>
                    <div className='col col__name'>
                        <div className='post__img'>
                            <span className='profile-icon'>
                                {avatar}
                            </span>
                        </div>
                    </div>
                    <div className='col col__name'>
                        <UserProfileComponent
                            userId={user?.id}
                            hasMention={true}
                            disablePopover={true}
                            overwriteName={previewPost.props?.override_username || ''}
                        />
                    </div>
                    <div className='col'>
                        <Timestamp
                            value={previewPost.create_at}
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
                <PostMessageView
                    post={previewPost}
                    overflowType='ellipsis'
                    maxHeight={105}
                />
                <div className='post__preview-footer'>
                    <p>
                        <FormattedMessage
                            id='post_message_preview.channel'
                            defaultMessage='Originally posted in ~{channel}'
                            values={{
                                channel: metadata.channel_display_name,
                            }}
                        />
                    </p>
                </div>
            </div>
        </PostAttachmentContainer>
    );
};

export default PostMessagePreview;
