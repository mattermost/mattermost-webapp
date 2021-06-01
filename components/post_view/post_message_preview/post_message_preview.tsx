// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from "react";

import { Post, PostPreviewMetadata } from "mattermost-redux/types/posts";
import UserProfileComponent from 'components/user_profile';
import {UserProfile} from 'mattermost-redux/types/users';
import Avatar from 'components/widgets/users/avatar';
import * as Utils from 'utils/utils';
import PostTime from "components/post_view/post_time";
import PostMessageView from 'components/post_view/post_message_view';

import Timestamp, {RelativeRanges} from 'components/timestamp';

const POST_TOOLTIP_RANGES = [
    RelativeRanges.TODAY_TITLE_CASE,
    RelativeRanges.YESTERDAY_TITLE_CASE,
];

export type Props = {
    user?: UserProfile;
    metadata: PostPreviewMetadata;
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
                                <div className='post__img'>
                                    <span className='profile-icon'>
                                        <Avatar
                                            username={this.props.user?.username}
                                            size={'md'}
                                            url={Utils.imageURLForUser(this.props.user?.id)}
                                        />
                                    </span>
                                </div>
                                <div className='post__header'>
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
                                            ranges={POST_TOOLTIP_RANGES}
                                        />
                                    </div>
                                </div>
                                <PostMessageView
                                    post={this.props.metadata}
                                />
                                {/* {this.props.metadata.message} */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}