// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, forwardRef} from 'react';

import {UserProfile} from 'mattermost-redux/types/users';

import MMCreateComment from 'components/create_comment';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import Constants from 'utils/constants';

type Props = {
    blockFocus: boolean;
    channelId?: string;
    channelIsArchived: boolean;
    channelType: string;
    isDeleted: boolean;
    isFakeDeletedPost: boolean;
    onHeightChange: () => void;
    teammate?: UserProfile;
    threadId: string;
};

const CreateComment = forwardRef<HTMLDivElement, Props>(({
    blockFocus,
    channelId,
    channelIsArchived,
    channelType,
    isDeleted,
    isFakeDeletedPost,
    onHeightChange,
    teammate,
    threadId,
}: Props, ref) => {
    // const postsArray = this.filterPosts(this.props.posts, this.props.selected, this.state.openTime);

    if (channelType === Constants.DM_CHANNEL) {
        if (teammate && teammate.delete_at) {
            return (
                <div
                    className='post-create-message'
                >
                    <FormattedMarkdownMessage
                        id='create_post.deactivated'
                        defaultMessage='You are viewing an archived channel with a **deactivated user**. New messages cannot be posted.'
                    />
                </div>
            );
        }
    }

    if (!isFakeDeletedPost) {
        if (channelIsArchived) {
            return (
                <div className='channel-archived-warning'>
                    <FormattedMarkdownMessage
                        id='archivedChannelMessage'
                        defaultMessage='You are viewing an **archived channel**. New messages cannot be posted.'
                    />
                </div>
            );
        }

        return (
            <div
                className='post-create__container'
                ref={ref}
            >
                <MMCreateComment
                    isFakeDeletedPost={isFakeDeletedPost}
                    onHeightChange={onHeightChange}
                    channelId={channelId}
                    rootId={threadId}
                    rootDeleted={isDeleted}
                    blockFocus={blockFocus}
                />
            </div>
        );
    }

    return null;
});

export default memo(CreateComment);
