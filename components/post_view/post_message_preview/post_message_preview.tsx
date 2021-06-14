// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from "react";

import { Post, PostPreviewMetadata } from "mattermost-redux/types/posts";
import UserProfileComponent from 'components/user_profile';
import {UserProfile} from 'mattermost-redux/types/users';
import Avatar from 'components/widgets/users/avatar';
import * as Utils from 'utils/utils';
import PostMessageView from 'components/post_view/post_message_view';
import {THREADING_TIME} from 'components/threading/common/options';

import Timestamp, {RelativeRanges} from 'components/timestamp';
import { Channel } from "mattermost-redux/types/channels";
import { Link } from "react-router-dom";
import PostAttachmentContainer from "../post_attachment_container/post_attachment_container";

export type Props = {
    user?: UserProfile;
    metadata: PostPreviewMetadata;
    channel?: Channel;
};
export default class PostMessagePreview extends React.PureComponent<Props> {
    render() {
        const {user, metadata} = this.props;
        console.log('hello');
        return (
            <PostAttachmentContainer
                className='permalink'
                link={`/ad-1/pl/${this.props.metadata.id}`}
            >
                <div className='post-preview'>
                    <div className='post__header'>
                        <div className='col col__name'>
                            <div className='post__img'>
                                <span className='profile-icon'>
                                    <Avatar
                                        username={this.props.user?.username}
                                        size={'sm'}
                                        url={Utils.imageURLForUser(this.props.user?.id)}
                                    />
                                </span>
                            </div>
                        </div>
                        <div className='col col__name'>
                            <UserProfileComponent
                                userId={this.props.user?.id}
                                hasMention={true}
                                disablePopover={true}
                            />
                        </div>
                        <div className='col'>
                            <Timestamp
                                value={this.props.metadata.create_at}
                                units={[
                                    'now',
                                    'minute',
                                    'hour',
                                    'day',
                                ]}
                                useTime={false}
                                day={'numeric'}
                                className='post__time'
                            />
                        </div>
                    </div>
                    <PostMessageView
                        post={this.props.metadata}
                        messagePreviewShowMore={true}
                    />
                    <div className='post__preview-footer'>
                        <p>
                            {`Originally posted in ~${this.props.channel?.display_name}`}
                        </p>
                    </div>
                </div>
            </PostAttachmentContainer>
        );
    }
}