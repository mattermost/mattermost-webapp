// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, forwardRef, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {getIsAdvancedTextEditorEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {UserProfile} from '@mattermost/types/users';
import {Post} from '@mattermost/types/posts';

import GenericCreateComment from 'components/create_comment';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import Constants from 'utils/constants';
import {Posts} from 'mattermost-redux/constants';
import {GlobalState} from 'types/store';
import AdvancedCreateComment from 'components/advanced_create_comment';
import BasicSeparator from 'components/widgets/separator/basic-separator';

type Props = {
    focusOnMount: boolean;
    onHeightChange: (height: number, maxHeight: number) => void;
    teammate?: UserProfile;
    threadId: string;
    latestPostId: Post['id'];
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
    const isAdvancedTextEditorEnabled = useSelector(getIsAdvancedTextEditorEnabled);
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
            <div className='channel-archived-warning__container'>
                <BasicSeparator/>
                <div className='channel-archived-warning__content'>
                    <i className='icon icon-archive-outline'/>
                    <FormattedMarkdownMessage
                        id='threadFromArchivedChannelMessage'
                        defaultMessage='You are viewing a thread from an **archived channel**. New messages cannot be posted.'
                    />
                </div>
            </div>
        );
    }
    if (isAdvancedTextEditorEnabled) {
        return (
            <div
                className='post-create__container'
                ref={ref}
            >
                <AdvancedCreateComment
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
