// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, forwardRef, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {UserProfile} from 'mattermost-redux/types/users';
import {Post} from 'mattermost-redux/types/posts';
import {$ID} from 'mattermost-redux/types/utilities';

import GenericCreateComment from 'components/create_comment';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import Constants from 'utils/constants';
import {Posts} from 'mattermost-redux/constants';
import {GlobalState} from 'types/store';

type Props = {
    focusOnMount: boolean;
    onHeightChange: (height: number, maxHeight: number) => void;
    teammate?: UserProfile;
    threadId: string;
    latestPostId: $ID<Post>;
    isThreadView?: boolean;
};

const CreateComment = forwardRef<HTMLDivElement, Props>(({
    focusOnMount,
    onHeightChange,
    teammate,
    threadId,
    latestPostId,
    isThreadView,
}: Props, ref) => {
    const getChannel = useMemo(makeGetChannel, []);
    const rootPost = useSelector((state: GlobalState) => getPost(state, threadId));
    const channel = useSelector((state: GlobalState) => getChannel(state, {id: rootPost.channel_id}));
    const rootDeleted = (rootPost as Post).state === Posts.POST_DELETED;
    const isFakeDeletedPost = rootPost.type === Constants.PostTypes.FAKE_PARENT_DELETED;

    const channelType = channel.type;
    const channelIsArchived = channel.delete_at !== 0;

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
                channelId={channel.id}
                latestPostId={latestPostId}
                onHeightChange={onHeightChange}
                rootDeleted={rootDeleted}
                rootId={threadId}
                isThreadView={isThreadView}
            />
        </div>
    );
});

export default memo(CreateComment);
