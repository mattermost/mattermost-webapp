// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, forwardRef} from 'react';

import {UserProfile} from 'mattermost-redux/types/users';
import {Post} from 'mattermost-redux/types/posts';
import {$ID} from 'mattermost-redux/types/utilities';

import GenericCreateComment from 'components/create_comment';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import Constants from 'utils/constants';

type Props = {
    focusOnMount: boolean;
    channelId: string;
    channelIsArchived: boolean;
    channelType: string;
    isDeleted: boolean;
    isFakeDeletedPost: boolean;
    onHeightChange: (height: number, maxHeight: number) => void;
    teammate?: UserProfile;
    threadId: string;
    latestPostId: $ID<Post>;
    isThreadView?: boolean;
};

const CreateComment = forwardRef<HTMLDivElement, Props>(({
    focusOnMount,
    channelId,
    channelIsArchived,
    channelType,
    isDeleted,
    isFakeDeletedPost,
    onHeightChange,
    teammate,
    threadId,
    latestPostId,
    isThreadView,
}: Props, ref) => {
    if (channelType === Constants.DM_CHANNEL && teammate?.delete_at) {
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

    if (isFakeDeletedPost) {
        return null;
    }

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
            <GenericCreateComment
                focusOnMount={focusOnMount}
                channelId={channelId}
                latestPostId={latestPostId}
                onHeightChange={onHeightChange}
                rootDeleted={isDeleted}
                rootId={threadId}
                isThreadView={isThreadView}
            />
        </div>
    );
});

export default memo(CreateComment);
