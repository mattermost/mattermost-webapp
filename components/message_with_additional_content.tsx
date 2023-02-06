// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Posts} from 'mattermost-redux/constants';

import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageView from 'components/post_view/post_message_view';

import {PluginsState} from 'types/store/plugins';

import {Post} from '@mattermost/types/posts';

type Props = {
    id?: string;
    post: Post;
    isEmbedVisible?: boolean;
    pluginPostTypes?: PluginsState['postTypes'];
    isRHS: boolean;
    compactDisplay?: boolean;
}

export default function MessageWithAdditionalContent({post, isEmbedVisible, pluginPostTypes, isRHS, compactDisplay}: Props) {
    const hasPlugin = post.type && pluginPostTypes?.hasOwnProperty(post.type);
    let msg;
    const messageWrapper = (
        <PostMessageView
            post={post}
            isRHS={isRHS}
            compactDisplay={compactDisplay}
        />
    );
    if (post.state === Posts.POST_DELETED || hasPlugin) {
        msg = messageWrapper;
    } else {
        msg = (
            <PostBodyAdditionalContent
                post={post}
                isEmbedVisible={isEmbedVisible}
            >
                {messageWrapper}
            </PostBodyAdditionalContent>
        );
    }
    return msg;
}
