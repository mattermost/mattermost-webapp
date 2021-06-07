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

export type Props = {
    user?: UserProfile;
    metadata: PostPreviewMetadata;
    channel?: Channel;
};
export default class PostMessagePreview extends React.PureComponent<Props> {
    render() {
        const {user, metadata} = this.props;
        return (
            <div className='attachment attachment--opengraph'>
                <div className='attachment__content'>
                    <div className={'clearfix attachment__container attachment__container--opengraph'}>
                        <div className={'attachment__body__wrap attachment__body__wrap--opengraph'}>
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
                                <p className='post__time'>{`Originally posted in ~${this.props.channel?.display_name}`}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}